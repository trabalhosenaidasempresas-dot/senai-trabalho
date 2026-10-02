import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, TextField, MenuItem, FormControl, InputLabel, Select, Chip, Typography, Stack } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const CATEGORIAS = [
  'Seguranca',
  'Limpeza',
  'Manutencao',
  'Recepcao',
  'Bombeiros',
  'Ar condicionado',
  'Elevador',
  'Extintores',
  'Bomba hidraulica',
  'Caixa d\'agua',
  'Dedetizacao',
  'Limpeza de esgoto',
  'Outros',
];

const TIPO_SERVICO_LABELS = {
  Contratado: 'Serviços Contratados',
  Manutenção: 'Manutenções',
};
const SERVICO_TIPOS = Object.keys(TIPO_SERVICO_LABELS);
const STATUS = ['Vigente', 'Vencido', 'Vencendo em até 30 dias', 'Pendente', 'Concluído'];
const PERIODICIDADES = ['Diária', 'Semanal', 'Mensal', 'Trimestral', 'Semestral', 'Anual', 'Sob demanda'];

const normalizeTipoServico = (value) => {
  if (!value) return undefined;
  if (value === 'Serviços Contratados') return 'Contratado';
  if (value === 'Manutenções') return 'Manutenção';
  return value;
};

const schema = yup.object({
  tipoServico: yup.string().oneOf(SERVICO_TIPOS, 'Tipo de serviço inválido').required('Tipo de serviço é obrigatório'),
  nome: yup.string().trim().required('Nome do serviço é obrigatório'),
  equipamento: yup.string().trim().optional(),
  escala: yup.string().trim().optional(),
  categoria: yup.string().oneOf(CATEGORIAS, 'Categoria inválida').required('Categoria é obrigatória'),
  fornecedor: yup.string().trim().required('Fornecedor é obrigatório'),
  documentoId: yup.string().trim().optional(),
  dataInicio: yup.date().required('Data de início é obrigatória'),
  dataVencimento: yup.date().required('Data de vencimento é obrigatória'),
  periodicidade: yup.string().trim().required('Periodicidade é obrigatória'),
  ultimaManutencao: yup.string().trim().nullable().optional(),
  proximaManutencao: yup
    .date()
    .transform((value, originalValue) => (originalValue === '' ? null : value))
    .nullable()
    .optional(),
  status: yup.string().trim().required('Status é obrigatório'),
  observacoes: yup.string().trim().optional(),
});

const createInitialValues = (defaultValues = {}) => {
  const today = new Date();
  const in30 = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const toIso = (d) => d.toISOString().slice(0, 10);

  return {
    tipoServico: normalizeTipoServico(defaultValues.tipoServico) || 'Contratado',
    nome: '',
    equipamento: '',
    escala: '',
    categoria: 'Seguranca',
    fornecedor: '',
    documentoId: '',
    dataInicio: defaultValues.dataInicio || toIso(today),
    dataVencimento: defaultValues.dataVencimento || toIso(in30),
    periodicidade: 'Mensal',
    ultimaManutencao: '',
    proximaManutencao: '',
    status: 'Vigente',
    observacoes: '',
    anexos: defaultValues.anexos || [],
    fotos: defaultValues.fotos || [],
    ...defaultValues,
  };
};


export const ServicoForm = ({ defaultValues = {}, onSubmit }) => {
  const values = useMemo(() => createInitialValues(defaultValues), [defaultValues]);
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: values,
  });

  const [anexos, setAnexos] = useState(() => values.anexos || []);
  const [fotos, setFotos] = useState(() => values.fotos || []);
  const anexosInput = useRef(null);
  const fotosInput = useRef(null);

  useEffect(() => {
    setValue('anexos', anexos);
  }, [anexos, setValue]);

  useEffect(() => {
    setValue('fotos', fotos);
  }, [fotos, setValue]);

  const handleAddFiles = (files, setter, acceptedTypes) => {
    const selected = Array.from(files || []).filter((file) => acceptedTypes.some((type) => file.type.includes(type) || file.name.toLowerCase().includes(type)));
    if (!selected.length) return;
    setter((prev) => [...prev, ...selected]);
  };

  const buildFormData = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'anexos' || key === 'fotos') {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            if (item instanceof File) formData.append(key, item);
            else if (typeof item === 'string') formData.append(key, item);
          });
        }
        return;
      }

      if (typeof value === 'string' && value.trim() === '' && key.toLowerCase().endsWith('id')) {
        return;
      }

      formData.append(key, value);
    });

    return formData;
  };

  const handleFormSubmit = async (data) => {
    const payload = buildFormData({
      ...data,
      anexos,
      fotos,
    });
    await onSubmit(payload);
  };

  const removeItem = (index, list, setter) => {
    setter(list.filter((_, idx) => idx !== index));
  };

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ display: 'grid', gap: 2 }}>
      <Controller name="tipoServico" control={control} render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel>Tipo de serviço</InputLabel>
          <Select label="Tipo de serviço" {...field}>
            {SERVICO_TIPOS.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>{TIPO_SERVICO_LABELS[tipo]}</MenuItem>
            ))}
          </Select>
          <Typography variant="caption" color="error">{errors.tipoServico?.message}</Typography>
        </FormControl>
      )} />

      <Controller name="nome" control={control} render={({ field }) => (
        <TextField label="Nome do serviço" fullWidth error={!!errors.nome} helperText={errors.nome?.message} {...field} />
      )} />

      <Controller name="equipamento" control={control} render={({ field }) => (
        <TextField label="Equipamento" fullWidth error={!!errors.equipamento} helperText={errors.equipamento?.message} {...field} />
      )} />

      <Controller name="categoria" control={control} render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel>Categoria</InputLabel>
          <Select label="Categoria" {...field}>
            {CATEGORIAS.map((categoria) => <MenuItem key={categoria} value={categoria}>{categoria}</MenuItem>)}
          </Select>
          <Typography variant="caption" color="error">{errors.categoria?.message}</Typography>
        </FormControl>
      )} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Controller name="fornecedor" control={control} render={({ field }) => (
          <TextField label="Fornecedor" fullWidth error={!!errors.fornecedor} helperText={errors.fornecedor?.message} {...field} />
        )} />
        <Controller name="escala" control={control} render={({ field }) => (
          <TextField label="Escala" fullWidth error={!!errors.escala} helperText={errors.escala?.message} {...field} />
        )} />
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Controller name="documentoId" control={control} render={({ field }) => (
          <TextField label="Documento relacionado (ID)" fullWidth error={!!errors.documentoId} helperText={errors.documentoId?.message} {...field} />
        )} />
        <Controller name="periodicidade" control={control} render={({ field }) => (
          <FormControl fullWidth>
            <InputLabel>Periodicidade</InputLabel>
            <Select label="Periodicidade" {...field}>
              {PERIODICIDADES.map((periodo) => <MenuItem key={periodo} value={periodo}>{periodo}</MenuItem>)}
            </Select>
            <Typography variant="caption" color="error">{errors.periodicidade?.message}</Typography>
          </FormControl>
        )} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Controller name="dataInicio" control={control} render={({ field }) => (
          <TextField label="Data de início" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.dataInicio} helperText={errors.dataInicio?.message} {...field} />
        )} />
        <Controller name="dataVencimento" control={control} render={({ field }) => (
          <TextField label="Data de vencimento" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.dataVencimento} helperText={errors.dataVencimento?.message} {...field} />
        )} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Controller name="ultimaManutencao" control={control} render={({ field }) => (
          <TextField label="Última manutenção" type="text" fullWidth error={!!errors.ultimaManutencao} helperText={errors.ultimaManutencao?.message || 'Data ou texto livre'} {...field} />
        )} />
        <Controller name="proximaManutencao" control={control} render={({ field }) => (
          <TextField label="Próxima manutenção" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.proximaManutencao} helperText={errors.proximaManutencao?.message} {...field} />
        )} />
      </Box>

      <Controller name="status" control={control} render={({ field }) => (
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select label="Status" {...field}>
            {STATUS.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
          </Select>
          <Typography variant="caption" color="error">{errors.status?.message}</Typography>
        </FormControl>
      )} />

      <Controller name="observacoes" control={control} render={({ field }) => (
        <TextField label="Observações" fullWidth multiline rows={4} error={!!errors.observacoes} helperText={errors.observacoes?.message} {...field} />
      )} />

      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="subtitle2">Anexos</Typography>
        <Button variant="outlined" onClick={() => anexosInput.current?.click()}>Selecionar arquivos</Button>
        <input
          ref={anexosInput}
          type="file"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => handleAddFiles(event.target.files, setAnexos, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt'])}
        />
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {anexos.map((item, index) => (
            <Chip key={`${item}-${index}`} label={item instanceof File ? item.name : item} onDelete={() => removeItem(index, anexos, setAnexos)} />
          ))}
        </Stack>
      </Box>

      <Box sx={{ display: 'grid', gap: 2 }}>
        <Typography variant="subtitle2">Fotos</Typography>
        <Button variant="outlined" onClick={() => fotosInput.current?.click()}>Selecionar fotos</Button>
        <input
          ref={fotosInput}
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          onChange={(event) => handleAddFiles(event.target.files, setFotos, ['jpg', 'jpeg', 'png', 'gif'])}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 1 }}>
          {fotos.map((item, index) => {
            const url = item instanceof File ? URL.createObjectURL(item) : item;
            return (
              <Box key={`${item}-${index}`} sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                <img src={url} alt="Foto" style={{ width: '100%', display: 'block' }} />
                <Chip
                  label="Remover"
                  size="small"
                  onDelete={() => removeItem(index, fotos, setFotos)}
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(255,255,255,0.85)' }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" type="submit" disabled={isSubmitting}>Salvar</Button>
      </Box>
    </Box>
  );
};

export default ServicoForm;
