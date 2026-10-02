import React from 'react';
import { Button, TextField, Box, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object({
  nome: yup.string().trim().required('Nome é obrigatório'),
  codigo: yup.string().trim().required('Código é obrigatório'),
  categoria: yup.string().trim().required('Categoria é obrigatória'),
  unidade: yup.string().trim().required('Unidade é obrigatória'),
  quantidade: yup.number().typeError('Quantidade deve ser um número').integer('Quantidade deve ser um número inteiro').min(0, 'Quantidade não pode ser negativa').required('Quantidade é obrigatória'),
  estoqueMinimo: yup.number().typeError('Estoque Mínimo deve ser um número').integer('Estoque Mínimo deve ser um número inteiro').min(0, 'Estoque Mínimo não pode ser negativo').required('Estoque Mínimo é obrigatório'),
  estoqueMaximo: yup.number().typeError('Estoque Máximo deve ser um número').integer('Estoque Máximo deve ser um número inteiro').min(yup.ref('estoqueMinimo'), 'Estoque Máximo deve ser maior ou igual ao Estoque Mínimo').required('Estoque Máximo é obrigatório'),
  localizacao: yup.string().trim().required('Local de armazenamento é obrigatório'),
  descricao: yup.string().trim().nullable(),
  fornecedor: yup.string().trim().nullable(),
});

const categorias = ['Copa', 'Higiene', 'Limpeza', 'Material de Escritório', 'Manutenção', 'Informática', 'Diversos'];
const unidades = ['Un', 'Kg', 'L', 'M', 'M2', 'M3'];
const locais = ['Terreo', '2o andar'];

export const ProdutoForm = ({ defaultValues = {}, onSubmit, onCancel }) => {
  const formDefaultValues = {
    nome: '',
    codigo: '',
    categoria: '',
    unidade: '',
    quantidade: 0,
    estoqueMinimo: 0,
    estoqueMaximo: 0,
    localizacao: '',
    fornecedor: '',
    descricao: '',
    ...defaultValues,
  };

  const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: formDefaultValues,
  });

  return (
    <Box id="produto-form" component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: 860, p: 3, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, minWidth: 0 }}>
      <Controller name="nome" control={control} render={({ field }) => (
        <TextField
          label="Nome"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          error={!!errors.nome}
          helperText={errors.nome?.message}
          {...field}
        />
      )} />

      <Controller name="codigo" control={control} render={({ field }) => (
        <TextField
          label="Código"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          error={!!errors.codigo}
          helperText={errors.codigo?.message}
          {...field}
        />
      )} />

      <FormControl fullWidth size="medium" error={!!errors.categoria} sx={{ minHeight: 72 }}>
        <InputLabel id="categoria-label">Categoria</InputLabel>
        <Controller name="categoria" control={control} render={({ field }) => (
          <Select
            labelId="categoria-label"
            label="Categoria"
            {...field}
          >
            {categorias.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        )} />
        {errors.categoria && (
          <Box component="p" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1 }}>{errors.categoria?.message}</Box>
        )}
      </FormControl>

      <FormControl fullWidth size="medium" error={!!errors.unidade} sx={{ minHeight: 72 }}>
        <InputLabel id="unidade-label">Unidade</InputLabel>
        <Controller name="unidade" control={control} render={({ field }) => (
          <Select
            labelId="unidade-label"
            label="Unidade"
            {...field}
          >
            {unidades.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        )} />
        {errors.unidade && (
          <Box component="p" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1 }}>{errors.unidade?.message}</Box>
        )}
      </FormControl>

      <FormControl fullWidth size="medium" error={!!errors.localizacao} sx={{ minHeight: 72 }}>
        <InputLabel id="localizacao-label">Local de armazenamento</InputLabel>
        <Controller name="localizacao" control={control} render={({ field }) => (
          <Select
            labelId="localizacao-label"
            label="Local de armazenamento"
            {...field}
          >
            {locais.map((option) => (
              <MenuItem key={option} value={option}>{option}</MenuItem>
            ))}
          </Select>
        )} />
        {errors.localizacao && (
          <Box component="p" sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 1 }}>{errors.localizacao?.message}</Box>
        )}
      </FormControl>

      <Controller name="quantidade" control={control} render={({ field }) => (
        <TextField
          label="Quantidade"
          type="number"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          inputProps={{ min: 0 }}
          error={!!errors.quantidade}
          helperText={errors.quantidade?.message}
          {...field}
        />
      )} />

      <Controller name="estoqueMinimo" control={control} render={({ field }) => (
        <TextField
          label="Estoque Mínimo"
          type="number"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          inputProps={{ min: 0 }}
          error={!!errors.estoqueMinimo}
          helperText={errors.estoqueMinimo?.message}
          {...field}
        />
      )} />

      <Controller name="estoqueMaximo" control={control} render={({ field }) => (
        <TextField
          label="Estoque Máximo"
          type="number"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          inputProps={{ min: 0 }}
          error={!!errors.estoqueMaximo}
          helperText={errors.estoqueMaximo?.message}
          {...field}
        />
      )} />

      <Controller name="fornecedor" control={control} render={({ field }) => (
        <TextField
          label="Fornecedor"
          fullWidth
          size="medium"
          sx={{ minHeight: 48 }}
          error={!!errors.fornecedor}
          helperText={errors.fornecedor?.message}
          {...field}
        />
      )} />

      <Controller name="descricao" control={control} render={({ field }) => (
        <TextField
          label="Observações"
          fullWidth
          multiline
          minRows={3}
          size="medium"
          sx={{ minHeight: 48 }}
          error={!!errors.descricao}
          helperText={errors.descricao?.message}
          {...field}
        />
      )} />

      <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="outlined" onClick={onCancel} sx={{ minWidth: 140, minHeight: 48 }}>Cancelar</Button>
        <Button variant="contained" type="submit" disabled={isSubmitting} sx={{ minWidth: 160, minHeight: 48 }}>Salvar Produto</Button>
      </Box>
    </Box>
  );
};

export default ProdutoForm;
