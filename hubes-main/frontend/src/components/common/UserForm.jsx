import React from 'react';
import { Box, Button, TextField, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  nome: yup.string().required('Nome é obrigatório').min(3),
  email: yup.string().required('Email é obrigatório').email('Email inválido'),
  senha: yup.string().transform((value) => (value === '' ? null : value)).nullable()
    .when('$isEdit', {
      is: false,
      then: (schema) => schema.required('Senha é obrigatória').min(6, 'Senha deve ter pelo menos 6 caracteres'),
      otherwise: (schema) => schema.min(6, 'Senha deve ter pelo menos 6 caracteres'),
    }),
  telefone: yup.string().nullable(),
  setor: yup.string().nullable(),
  perfil: yup.string().required('Perfil é obrigatório'),
});

export const UserForm = ({ defaultValues = {}, onSubmit }) => {
  const isEdit = Boolean(defaultValues?.id);
  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    context: { isEdit },
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller name="nome" control={control} render={({ field }) => <TextField label="Nome" fullWidth error={!!errors.nome} helperText={errors.nome?.message} {...field} />} />
      <Controller name="email" control={control} render={({ field }) => <TextField label="Email" type="email" fullWidth error={!!errors.email} helperText={errors.email?.message} {...field} />} />
      <Controller name="senha" control={control} render={({ field }) => <TextField label="Senha" type="password" fullWidth error={!!errors.senha} helperText={errors.senha?.message} {...field} />} />
      <Controller name="telefone" control={control} render={({ field }) => <TextField label="Telefone" fullWidth {...field} />} />
      <Controller name="setor" control={control} render={({ field }) => <TextField label="Setor" fullWidth {...field} />} />
      <Controller name="perfil" control={control} render={({ field }) => (
        <TextField select label="Perfil" fullWidth {...field}>
          {['Administrador', 'Gestor', 'Servidor', 'Visitante'].map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="status" control={control} render={({ field }) => (
        <TextField select label="Status" fullWidth {...field}>
          {['Ativo', 'Inativo'].map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
        </TextField>
      )} />

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button variant="contained" type="submit" disabled={isSubmitting}>Salvar</Button>
      </Box>
    </Box>
  );
};

export default UserForm;
