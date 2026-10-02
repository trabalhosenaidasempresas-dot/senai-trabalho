import React, { useEffect, useState } from 'react';
import { TextField, Box, Grid, MenuItem, Typography, Button, Collapse } from '@mui/material';
import Holidays from 'date-holidays';
import { agendaService } from '../../services/agendaService';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const hd = new Holidays('BR');

const isHoliday = (date) => {
  const holiday = hd.isHoliday(date);
  return !!holiday;
};

const isUnavailableDate = (date) => {
  if (!date || Number.isNaN(date.getTime())) return false;
  return date.getDay() === 0 || isHoliday(date);
};

const schema = yup.object({
  titulo: yup.string().trim().required('Título é obrigatório'),
  descricao: yup.string().trim().optional(),
  local: yup.string().trim().required('Local é obrigatório'),
  dataInicio: yup.string().required('Data de início é obrigatória'),
  dataFim: yup
    .string()
    .required('Data fim é obrigatória')
    .test('dataFimMaior', 'Data fim deve ser igual ou posterior à data início', function (value) {
      const { dataInicio } = this.parent;
      if (!dataInicio || !value) return true;
      return new Date(value) >= new Date(dataInicio);
    }),
  nome: yup.string().trim().required('Nome é obrigatório'),
  telefone: yup
    .string()
    .trim()
    .matches(/^(\(\d{2}\) \d{5}-\d{4})$/, 'Telefone deve estar no formato (00) 00000-0000')
    .required('Telefone é obrigatório'),
  email: yup.string().trim().email('Email inválido').required('Email é obrigatório'),
});

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  const area = digits.slice(0, 2);
  const first = digits.slice(2, 7);
  const last = digits.slice(7, 11);

  let formatted = `(${area}`;
  if (first) formatted += `) ${first}`;
  if (last) formatted += `-${last}`;
  return formatted;
};

export const EventoForm = ({ defaultValues = {}, onSubmit }) => {
  const initialValues = {
    titulo: '',
    descricao: '',
    local: '',
    dataInicio: '',
    dataFim: '',
    nome: '',
    telefone: '',
    email: '',
    ...defaultValues,
  };

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [dateError, setDateError] = useState('');

  const localValue = watch('local');
  const dataFimValue = watch('dataFim');
  const selectedEndHour = dataFimValue ? new Date(dataFimValue).getHours() : null;

  useEffect(() => {
    if (!localValue) return;
    setCalendarOpen(true);
    setDateError('');
    // carregar disponibilidade por dia do mês usando novo endpoint
    (async () => {
      try {
        const days = generateMonthDays(currentMonth);
        const map = {};
        await Promise.all(days.map(async (d) => {
          const dateStr = d.toISOString().slice(0,10);
          try {
            const res = await agendaService.disponibilidade({ local: localValue, date: dateStr });
            map[dateStr] = res.events || [];
          } catch (e) {
            map[dateStr] = [];
          }
        }));
        const flat = Object.values(map).flat();
        setEvents(flat);
        setSelectedDate(null);
        setSelectedTime(null);
      } catch (err) {
        setEvents([]);
      }
    })();
  }, [localValue, currentMonth]);

  useEffect(() => {
    if (selectedDate && typeof selectedTime === 'number' && dataFimValue) {
      setCalendarOpen(false);
    }
  }, [selectedDate, selectedTime, dataFimValue]);

  const startOfMonth = (d) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  const generateMonthDays = (d) => {
    const start = startOfMonth(d);
    const end = endOfMonth(d);
    const days = [];
    for (let i = 1; i <= end.getDate(); i++) days.push(new Date(d.getFullYear(), d.getMonth(), i));
    return days;
  };

  const getDayLabel = (date) => {
    if (date.getDay() === 0) return 'Domingo';
    if (isHoliday(date)) return 'Feriado Nacional';
    return null;
  };

  const timeslots = [8,9,10,11,12,13,14,15,16,17,18]; // endpoints up to 18

  // normalize event intervals as Date objects
  const parsedEvents = events.map(ev => ({
    start: ev.dataInicio ? new Date(ev.dataInicio) : null,
    end: ev.dataFim ? new Date(ev.dataFim) : null,
  }));

  const intervalOverlaps = (aStart, aEnd, bStart, bEnd) => {
    return aStart < bEnd && bStart < aEnd;
  };

  const hasConflict = (startDate, endDate) => {
    return parsedEvents.some(ev => ev.start && ev.end && intervalOverlaps(startDate, endDate, ev.start, ev.end));
  };

  const availableStartOptions = (date) => {
    if (!date) return [];
    const opts = [];
    for (let h = 8; h <= 17; h++) {
      // check if there exists an end > h such that [h,end] does not conflict
      let ok = false;
      for (let eh = h+1; eh <= 18; eh++) {
        const s = new Date(date); s.setHours(h,0,0,0);
        const e = new Date(date); e.setHours(eh,0,0,0);
        if (!hasConflict(s,e)) { ok = true; break; }
      }
      opts.push({ hour: h, available: ok });
    }
    return opts;
  };

  const availableEndOptions = (date, startHour) => {
    if (!date || typeof startHour !== 'number') return [];
    const opts = [];
    for (let eh = startHour+1; eh <= 18; eh++) {
      const s = new Date(date); s.setHours(startHour,0,0,0);
      const e = new Date(date); e.setHours(eh,0,0,0);
      const ok = !hasConflict(s,e);
      opts.push({ hour: eh, available: ok });
    }
    return opts;
  };

  const handleSelectTimeInterval = (startHour, endHour, date) => {
    const s = new Date(date); s.setHours(startHour,0,0,0);
    const e = new Date(date); e.setHours(endHour,0,0,0);
    if (isUnavailableDate(date)) {
      setIntervalError('Esta data não está disponível para agendamento. As salas não podem ser reservadas aos domingos e feriados.');
      return false;
    }
    if (hasConflict(s,e)) {
      setIntervalError('Já existe um evento agendado para esta sala nesse período.');
      return false;
    }
    setIntervalError('');
    setValue('dataInicio', s.toISOString());
    setValue('dataFim', e.toISOString());
    setSelectedDate(date);
    setSelectedTime(startHour);
    return true;
  };

  const [intervalError, setIntervalError] = useState('');

  return (
    <Box component="form" id="evento-form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Controller
        name="titulo"
        control={control}
        render={({ field }) => (
          <TextField
            label="Título"
            placeholder="Digite o título do evento"
            fullWidth
            required
            error={!!errors.titulo}
            helperText={errors.titulo?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="descricao"
        control={control}
        render={({ field }) => (
          <TextField
            label="Descrição"
            placeholder="Digite a descrição do evento"
            fullWidth
            multiline
            rows={4}
            error={!!errors.descricao}
            helperText={errors.descricao?.message}
            {...field}
          />
        )}
      />

      <Controller
        name="local"
        control={control}
        render={({ field }) => (
          <TextField
            select
            label="Local"
            fullWidth
            required
            error={!!errors.local}
            helperText={errors.local?.message}
            {...field}
          >
            {['Sala 1', 'Sala 2', 'Sala 3', 'Auditório', 'Quadra'].map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        )}
      />

      {/* Calendário de disponibilidade */}
      {localValue && (
        <Collapse in={calendarOpen} timeout={300} unmountOnExit>
          <Box>
            <Typography variant="subtitle1">Disponibilidade - {localValue}</Typography>
            {dateError && (
              <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                {dateError}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', marginTop: 1 }}>
              <Box>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                  <Button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()-1, 1))}>{'<'}</Button>
                  <Typography>{currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' })}</Typography>
                  <Button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth()+1, 1))}>{'>'}</Button>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 40px)', gap: 0.5 }}>
                  {generateMonthDays(currentMonth).map((day) => {
                    const hasEvent = events.some(ev => ev.dataInicio && (new Date(ev.dataInicio)).toDateString() === day.toDateString());
                    const unavailable = isUnavailableDate(day);
                    return (
                      <Box
                        key={day.toISOString()}
                        onClick={() => {
                          if (unavailable) {
                            setDateError('Esta data não está disponível para agendamento. As salas não podem ser reservadas aos domingos e feriados.');
                            return;
                          }
                          setDateError('');
                          setSelectedDate(day);
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: unavailable ? 'not-allowed' : 'pointer',
                          backgroundColor: selectedDate && selectedDate.toDateString() === day.toDateString() ? '#cfe8d8' : unavailable ? '#f0f0f0' : '#fff',
                          border: '1px solid rgba(0,0,0,0.12)',
                          color: unavailable ? 'rgba(0,0,0,0.38)' : 'inherit',
                          position: 'relative',
                        }}
                      >
                        <Typography variant="body2">{day.getDate()}</Typography>
                        {unavailable && (
                          <Typography component="span" variant="caption" sx={{ position: 'absolute', bottom: 2, fontSize: 8, lineHeight: 1 }}>
                            {getDayLabel(day)}
                          </Typography>
                        )}
                        {hasEvent && !unavailable && <Box component="span" sx={{ width: 6, height: 6, bgcolor: 'red', borderRadius: '50%', ml: 0.5 }} />}
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              <Box sx={{ minWidth: 220 }}>
                <Typography variant="subtitle2">Horários - {selectedDate ? selectedDate.toLocaleDateString() : 'Selecione um dia'}</Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    select
                    label="Horário de Início"
                    value={selectedTime ?? ''}
                    onChange={(e) => {
                      const sh = parseInt(e.target.value, 10);
                      setSelectedTime(sh);
                      // clear fim seleção
                      setValue('dataFim', '');
                      setIntervalError('');
                    }}
                    fullWidth
                    disabled={!selectedDate}
                    helperText={intervalError || errors.dataInicio?.message}
                  >
                    {availableStartOptions(selectedDate).map(opt => (
                      <MenuItem key={opt.hour} value={opt.hour} disabled={!opt.available} sx={{ color: opt.available ? 'green' : 'red' }}>
                        {`${opt.hour.toString().padStart(2,'0')}:00`} {opt.available ? ' - Disponível' : ' - Ocupado'}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="Horário de Fim"
                    value={watch('dataFim') ? new Date(watch('dataFim')).getHours() : ''}
                    onChange={(e) => {
                      const eh = parseInt(e.target.value, 10);
                      const sh = selectedTime;
                      if (selectedDate && typeof sh === 'number') {
                        const ok = handleSelectTimeInterval(sh, eh, selectedDate);
                        if (!ok) {
                          // keep selection
                        }
                      }
                    }}
                    fullWidth
                    disabled={!selectedDate || typeof selectedTime !== 'number'}
                  >
                    {availableEndOptions(selectedDate, selectedTime).map(opt => (
                      <MenuItem key={opt.hour} value={opt.hour} disabled={!opt.available} sx={{ color: opt.available ? 'green' : 'red' }}>
                        {`${opt.hour.toString().padStart(2,'0')}:00`} {opt.available ? ' - Disponível' : ' - Ocupado'}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
              </Box>
            </Box>
          </Box>
        </Collapse>
      )}

      <Collapse in={localValue && dataFimValue && !calendarOpen} timeout={300} unmountOnExit>
        <Box sx={{ mt: 2, p: 2, border: '1px solid rgba(0,0,0,0.08)', borderRadius: 1, bgcolor: 'background.paper' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>Resumo da reserva</Typography>
          <Typography variant="body2">📍 Local: {localValue}</Typography>
          <Typography variant="body2">📅 Data: {selectedDate ? selectedDate.toLocaleDateString() : ''}</Typography>
          <Typography variant="body2">🕒 Horário: {selectedTime != null ? `${selectedTime.toString().padStart(2,'0')}:00` : '--'} às {selectedEndHour != null ? `${selectedEndHour.toString().padStart(2,'0')}:00` : '--'}</Typography>
          <Button sx={{ mt: 1 }} size="small" variant="text" onClick={() => setCalendarOpen(true)}>
            Alterar data e horário
          </Button>
        </Box>
      </Collapse>

      <Controller
        name="nome"
        control={control}
        render={({ field }) => (
          <TextField
            label="Nome"
            placeholder="Digite o nome do contato"
            fullWidth
            required
            error={!!errors.nome}
            helperText={errors.nome?.message}
            {...field}
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <TextField
                label="Telefone"
                placeholder="(00) 00000-0000"
                fullWidth
                required
                inputProps={{ inputMode: 'tel' }}
                error={!!errors.telefone}
                helperText={errors.telefone?.message}
                {...field}
                onChange={(event) => field.onChange(formatPhone(event.target.value))}
              />
            )}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                label="Email"
                placeholder="exemplo@email.com"
                fullWidth
                required
                error={!!errors.email}
                helperText={errors.email?.message}
                {...field}
              />
            )}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventoForm;
