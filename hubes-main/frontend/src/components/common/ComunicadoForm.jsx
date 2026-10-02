import React from 'react';
import { Button, TextField, Box } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  titulo: yup.string().trim().required('Título é obrigatório'),
  conteudo: yup.string().trim().required('Conteúdo é obrigatório'),
  tipo: yup.string().trim().required('Tipo é obrigatório'),
  status: yup.string().trim().required('Status é obrigatório'),
  dataVencimento: yup.date().nullable().optional(),
  anexos: yup.string().trim().optional(),
});

export const ComunicadoForm = ({ defaultValues = {}, onSubmit }) => {
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller name="titulo" control={control} render={({ field }) => (
        <TextField label="Título" fullWidth error={!!errors.titulo} helperText={errors.titulo?.message} {...field} />
      )} />
      <Controller name="conteudo" control={control} render={({ field }) => (
        <TextField label="Conteúdo" fullWidth multiline rows={4} error={!!errors.conteudo} helperText={errors.conteudo?.message} {...field} />
      )} />
      <Controller name="tipo" control={control} render={({ field }) => (
        <TextField label="Tipo" fullWidth error={!!errors.tipo} helperText={errors.tipo?.message} {...field} />
      )} />
      <Controller name="status" control={control} render={({ field }) => (
        <TextField label="Status" fullWidth error={!!errors.status} helperText={errors.status?.message} {...field} />
      )} />
      <Controller name="dataVencimento" control={control} render={({ field }) => (
        <TextField label="Data de vencimento" type="date" InputLabelProps={{ shrink: true }} fullWidth error={!!errors.dataVencimento} helperText={errors.dataVencimento?.message} {...field} />
      )} />
      <Controller name="anexos" control={control} render={({ field }) => (
        <TextField label="Anexos" fullWidth error={!!errors.anexos} helperText={errors.anexos?.message} {...field} />
      )} />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" type="submit" disabled={isSubmitting}>Salvar</Button>
      </Box>
    </Box>
  );
};

export default ComunicadoForm;
