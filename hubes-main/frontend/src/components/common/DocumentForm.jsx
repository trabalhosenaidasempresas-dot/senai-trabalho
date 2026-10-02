import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, TextField, Box, FormHelperText, FormControlLabel, Checkbox } from '@mui/material';
import * as yup from 'yup';
import CameraCapture from './CameraCapture';

const buildDefaultValues = (defaultValues = {}) => {
  const normalized = {
    titulo: '',
    descricao: '',
    assinado: false,
    arquivo: null,
    categoria: defaultValues.categoria || 'Outros',
    data: defaultValues.data || null,
    dataVencimento: defaultValues.dataVencimento || null,
    fornecedor: defaultValues.fornecedor || '',
    fotos: [],
    ...defaultValues,
  };

  return normalized;
};

const createSchema = (isEdit) => yup.object({
  titulo: yup.string().trim().required('Título é obrigatório').min(3, 'Título deve ter pelo menos 3 caracteres'),
  categoria: yup.string().trim().required('Categoria é obrigatória'),
  descricao: yup.string().trim().optional().nullable(),
  assinado: yup.boolean().optional(),
  arquivo: isEdit
    ? yup.mixed().nullable()
    : yup.mixed().required('Arquivo é obrigatório'),
  data: yup.date().optional().nullable(),
  dataVencimento: yup.date().optional().nullable(),
  fornecedor: yup.string().max(255).optional().nullable(),
});

export const DocumentForm = ({ defaultValues = {}, onSubmit, isEdit = false }) => {
  const normalizedDefaultValues = useMemo(() => buildDefaultValues(defaultValues), [defaultValues]);
  const [values, setValues] = useState(normalizedDefaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);
  const fotosInputRef = useRef(null);

  useEffect(() => {
    setValues(normalizedDefaultValues);
  }, [normalizedDefaultValues]);

  const handleFieldChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateForm = () => {
    const schema = createSchema(isEdit);
    try {
      schema.validateSync(values, { abortEarly: false });
      return {};
    } catch (error) {
      if (!error.inner) return { form: error.message };
      return error.inner.reduce((acc, item) => ({ ...acc, [item.path]: item.message }), {});
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const payload = {
        titulo: values.titulo?.trim(),
        descricao: values.descricao?.trim() || null,
        assinado: values.assinado || false,
        categoria: values.categoria,
        data: values.data || undefined,
        dataVencimento: values.dataVencimento || undefined,
        fornecedor: values.fornecedor?.trim() || null,
      };

      if (isEdit && (!values.arquivo || !values.arquivo.length)) {
        await onSubmit(payload);
        return;
      }

      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });

      if (values.arquivo && values.arquivo.length) {
        formData.append('arquivo', values.arquivo[0]);
      }

      if (values.fotos && values.fotos.length) {
        for (let i = 0; i < values.fotos.length; i += 1) {
          formData.append('fotos', values.fotos[i]);
        }
      }

      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const arquivoLabel = values.arquivo && values.arquivo.length
    ? values.arquivo[0].name
    : defaultValues?.arquivo
      ? 'Arquivo atual preservado'
      : 'Nenhum arquivo selecionado';

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        label="Título"
        fullWidth
        value={values.titulo}
        onChange={(event) => handleFieldChange('titulo', event.target.value)}
        error={Boolean(errors.titulo)}
        helperText={errors.titulo}
      />

      <TextField
        label="Descrição"
        fullWidth
        multiline
        rows={3}
        value={values.descricao}
        onChange={(event) => handleFieldChange('descricao', event.target.value)}
        error={Boolean(errors.descricao)}
        helperText={errors.descricao}
      />

      <TextField
        label="Fornecedor"
        fullWidth
        value={values.fornecedor}
        onChange={(event) => handleFieldChange('fornecedor', event.target.value)}
        error={Boolean(errors.fornecedor)}
        helperText={errors.fornecedor}
      />

      <TextField
        label="Data do documento"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={values.data ? new Date(values.data).toISOString().substring(0, 10) : ''}
        onChange={(event) => handleFieldChange('data', event.target.value ? new Date(event.target.value).toISOString() : null)}
        error={Boolean(errors.data)}
        helperText={errors.data}
      />

      <TextField
        label="Data de vencimento"
        type="date"
        fullWidth
        InputLabelProps={{ shrink: true }}
        value={values.dataVencimento ? new Date(values.dataVencimento).toISOString().substring(0, 10) : ''}
        onChange={(event) => handleFieldChange('dataVencimento', event.target.value ? new Date(event.target.value).toISOString() : null)}
        error={Boolean(errors.dataVencimento)}
        helperText={errors.dataVencimento}
      />

      <FormControlLabel
        control={
          <Checkbox
            checked={values.assinado}
            onChange={(event) => handleFieldChange('assinado', event.target.checked)}
          />
        }
        label="Assinado"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            accept="*"
            id="document-file"
            style={{ display: 'none' }}
            onChange={(event) => {
              handleFieldChange('arquivo', event.target.files);
              if (event.target.files && event.target.files.length) {
                setErrors((prev) => ({ ...prev, arquivo: undefined }));
              }
            }}
          />
          <input
            ref={fotosInputRef}
            type="file"
            accept="image/*"
            id="document-photos"
            multiple
            style={{ display: 'none' }}
            onChange={(event) => {
              handleFieldChange('fotos', event.target.files);
            }}
          />
          <label htmlFor="document-file">
            <Button variant="outlined" component="span" onClick={() => fileInputRef.current?.click()}>Escolher arquivo</Button>
          </label>
          <label htmlFor="document-photos">
            <Button variant="outlined" component="span" onClick={() => fotosInputRef.current?.click()}>Adicionar fotos</Button>
          </label>
          <CameraCapture
            buttonLabel="Capturar documento"
            onCapture={(file) => handleFieldChange('arquivo', [file])}
            accept="*"
          />
        </Box>
        <Box component="span">{arquivoLabel}</Box>
        {errors.arquivo && <FormHelperText error>{errors.arquivo}</FormHelperText>}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button type="submit" variant="contained" disabled={isSubmitting}>{isEdit ? 'Salvar' : 'Enviar'}</Button>
      </Box>
    </Box>
  );
};

export default DocumentForm;
