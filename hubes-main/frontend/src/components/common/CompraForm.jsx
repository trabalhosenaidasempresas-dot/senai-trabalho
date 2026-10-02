import React from 'react';
import { Button, TextField, Box, Typography, Divider } from '@mui/material';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const formatCurrency = (value) => {
  if (value == null || value === '') return '';
  const number = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (Number.isNaN(number)) return '';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
};

const parseCurrency = (value) => {
  if (value == null) return null;
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  if (cleaned === '' || cleaned === '.' || cleaned === ',') return null;
  const number = Number(cleaned);
  return Number.isNaN(number) ? null : number;
};

const schema = yup.object({
  fornecedor: yup.string().trim().required('Fornecedor é obrigatório'),
  fornecedorEmail: yup.string().email('E-mail inválido').required('E-mail do fornecedor é obrigatório'),
  quantidade: yup.number().integer().min(1, 'Quantidade deve ser maior que zero').required('Quantidade é obrigatória'),
  observacao: yup.string().trim().optional(),
  dataEntrega: yup.date().nullable().optional(),
  itens: yup.array().of(
    yup.object({
      descricao: yup.string().trim().required('Descrição é obrigatória'),
      quantidade: yup.number().integer().min(1, 'Quantidade deve ser maior que zero').required('Quantidade é obrigatória'),
      valorUnitario: yup.number().min(0, 'Valor unitário deve ser maior ou igual a zero').required('Valor unitário é obrigatório'),
      especificacoes: yup.string().trim().optional(),
    }),
  ).optional(),
});

export const CompraForm = ({ defaultValues = {}, onSubmit }) => {
  const { control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'itens' });
  const itens = watch('itens') || [];
  const totalCalculado = itens.reduce((sum, item) => {
    const quantidade = Number(item.quantidade) || 0;
    const valorUnitario = Number(item.valorUnitario) || 0;
    return sum + quantidade * valorUnitario;
  }, 0);

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Controller name="fornecedor" control={control} render={({ field }) => (
        <TextField
          label="Fornecedor"
          fullWidth
          size="small"
          error={!!errors.fornecedor}
          helperText={errors.fornecedor?.message}
          {...field}
        />
      )} />

      <Controller name="fornecedorEmail" control={control} render={({ field }) => (
        <TextField
          label="E-mail do fornecedor"
          fullWidth
          size="small"
          type="email"
          error={!!errors.fornecedorEmail}
          helperText={errors.fornecedorEmail?.message}
          {...field}
        />
      )} />

      <Controller name="quantidade" control={control} render={({ field }) => (
        <TextField
          label="Quantidade"
          fullWidth
          size="small"
          type="number"
          inputProps={{ min: 1 }}
          error={!!errors.quantidade}
          helperText={errors.quantidade?.message}
          {...field}
        />
      )} />

      <Controller name="observacao" control={control} render={({ field }) => (
        <TextField
          label="Objeto da compra"
          fullWidth
          size="small"
          multiline
          rows={2}
          error={!!errors.observacao}
          helperText={errors.observacao?.message}
          {...field}
        />
      )} />

      <Controller name="createdAt" control={control} render={({ field }) => {
        const displayValue = field.value
          ? new Date(field.value).toLocaleString('pt-BR')
          : 'Será preenchido automaticamente ao salvar';
        return (
          <TextField
            label="Data e hora da compra"
            fullWidth
            size="small"
            InputProps={{ readOnly: true }}
            value={displayValue}
            helperText="Este campo é preenchido pelo servidor no momento do cadastro"
          />
        );
      }} />

      <Controller name="dataEntrega" control={control} render={({ field }) => (
        <TextField
          label="Data de entrega"
          type="date"
          InputLabelProps={{ shrink: true }}
          fullWidth
          size="small"
          error={!!errors.dataEntrega}
          helperText={errors.dataEntrega?.message}
          {...field}
        />
      )} />

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2">Itens da compra</Typography>
        <Button size="small" variant="outlined" onClick={() => append({ descricao: '', quantidade: 1, valorUnitario: 0, especificacoes: '' })}>
          Adicionar item
        </Button>
      </Box>

      {fields.map((item, index) => (
        <Box key={item.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, display: 'grid', gap: 1 }}>
          <Typography variant="caption">Item {index + 1}</Typography>
          <Controller name={`itens.${index}.descricao`} control={control} render={({ field }) => (
            <TextField
              label="Descrição"
              fullWidth
              size="small"
              error={!!errors.itens?.[index]?.descricao}
              helperText={errors.itens?.[index]?.descricao?.message}
              {...field}
            />
          )} />
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
            <Controller name={`itens.${index}.quantidade`} control={control} render={({ field }) => (
              <TextField
                label="Quantidade"
                type="number"
                fullWidth
                size="small"
                error={!!errors.itens?.[index]?.quantidade}
                helperText={errors.itens?.[index]?.quantidade?.message}
                {...field}
              />
            )} />
            <Controller name={`itens.${index}.valorUnitario`} control={control} render={({ field }) => (
              <TextField
                label="Valor unitário"
                type="number"
                fullWidth
                size="small"
                error={!!errors.itens?.[index]?.valorUnitario}
                helperText={errors.itens?.[index]?.valorUnitario?.message}
                {...field}
              />
            )} />
          </Box>
          <Controller name={`itens.${index}.especificacoes`} control={control} render={({ field }) => (
            <TextField
              label="Especificações"
              fullWidth
              size="small"
              multiline
              rows={2}
              error={!!errors.itens?.[index]?.especificacoes}
              helperText={errors.itens?.[index]?.especificacoes?.message}
              {...field}
            />
          )} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button size="small" color="error" onClick={() => remove(index)}>Remover item</Button>
          </Box>
        </Box>
      ))}

      {itens.length > 0 && (
        <Typography variant="body2">Total calculado pelos itens: R$ {totalCalculado.toFixed(2)}</Typography>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="small" variant="contained" type="submit" disabled={isSubmitting}>Salvar</Button>
      </Box>
    </Box>
  );
};

export default CompraForm;
