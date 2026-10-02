import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, TextField, Box, MenuItem, Typography, Grid, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import DeleteIcon from '@mui/icons-material/Delete';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const LOCAL_OPTIONS = ['Sala 1', 'Sala 2', 'Sala 3', 'Auditório', 'Quadra'];
const SETOR_OPTIONS = ['Manutenção', 'Limpeza'];
const PRIORIDADE_OPTIONS = ['Baixa', 'Média', 'Alta'];
const MAX_PHOTOS = 5;
const MAX_VIDEO_SECONDS = 10;

const schema = yup.object({
  descricao: yup.string().trim().required('Descrição é obrigatória'),
  local: yup.string().trim().required('Local é obrigatório'),
  setor: yup.string().trim().required('Setor é obrigatório'),
  prioridade: yup.string().trim().required('Prioridade é obrigatória').oneOf(PRIORIDADE_OPTIONS, 'Prioridade é obrigatória'),
  fotos: yup.array().optional(),
});

const getMediaType = (fileOrUrl) => {
  if (fileOrUrl instanceof File) {
    return fileOrUrl.type.startsWith('video/') ? 'video' : 'image';
  }
  if (typeof fileOrUrl === 'string') {
    const lower = fileOrUrl.split('?')[0].toLowerCase();
    if (lower.match(/\.(mp4|mov|webm|ogg|m4v)$/)) return 'video';
    return 'image';
  }
  return 'image';
};

const createPreviewItem = (fileOrUrl) => {
  if (fileOrUrl instanceof File) {
    const src = URL.createObjectURL(fileOrUrl);
    return {
      id: `${fileOrUrl.name}-${fileOrUrl.size}-${fileOrUrl.lastModified}`,
      file: fileOrUrl,
      src,
      type: getMediaType(fileOrUrl),
      objectUrl: src,
    };
  }
  if (typeof fileOrUrl === 'string' && fileOrUrl.trim() !== '') {
    return {
      id: fileOrUrl,
      file: null,
      src: fileOrUrl,
      type: getMediaType(fileOrUrl),
    };
  }
  return null;
};

const normalizeInitialMedia = (value) => {
  if (Array.isArray(value)) {
    return value.map(createPreviewItem).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim() !== '') {
    return [createPreviewItem(value)].filter(Boolean);
  }
  return [];
};

export const OcorrenciaForm = ({ defaultValues = {}, onSubmit }) => {
  const [previewItems, setPreviewItems] = useState(() => normalizeInitialMedia(defaultValues.fotos || []));
  const [uploadError, setUploadError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  const initialValues = {
    descricao: '',
    local: '',
    setor: '',
    prioridade: '',
    fotos: [],
    ...defaultValues,
  };

  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: initialValues,
  });

  const createdObjectUrls = useRef([]);

  useEffect(() => {
    setValue('fotos', previewItems.map((item) => item.file || item.src));
  }, [previewItems, setValue]);

  useEffect(() => {
    return () => {
      createdObjectUrls.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    const attachStream = async () => {
      if (!videoRef.current || !cameraStream || !cameraOpen) return;

      try {
        const videoElement = videoRef.current;
        videoElement.muted = true;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.srcObject = cameraStream;

        const playPromise = videoElement.play();
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (playError) {
        setCameraError(
          'A câmera foi ativada, mas não foi possível exibir o vídeo. Verifique se o navegador permite reprodução automática e tente novamente.'
        );
      }
    };

    attachStream();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream, cameraOpen]);

  const currentMediaType = useMemo(() => {
    if (!previewItems.length) return null;
    return previewItems[0].type;
  }, [previewItems]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const getCameraErrorMessage = (error) => {
    switch (error?.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'Permissão para usar a câmera foi negada. Por favor permita o acesso à câmera e tente novamente.';
      case 'NotFoundError':
      case 'DevicesNotFoundError':
        return 'Nenhuma câmera foi encontrada neste dispositivo.';
      case 'NotReadableError':
      case 'TrackStartError':
        return 'Não foi possível iniciar a câmera. Verifique se outro aplicativo não está usando a câmera.';
      case 'OverconstrainedError':
      case 'ConstraintNotSatisfiedError':
        return 'Não foi possível acessar a câmera solicitada. Tentando outra câmera...';
      case 'AbortError':
        return 'A operação de câmera foi cancelada. Tente novamente.';
      default:
        return 'Não foi possível acessar a câmera. Verifique as permissões e tente novamente.';
    }
  };

  const openCamera = async () => {
    if (currentMediaType === 'video') {
      setUploadError('Não é possível adicionar fotos quando já existe um vídeo anexado.');
      return;
    }

    setCameraError('');
    setCameraStream(null);
    setCameraOpen(true);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const message = 'Seu navegador não suporta acesso à câmera.';
      setCameraError(message);
      setUploadError(message);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      setCameraStream(stream);
    } catch (error) {
      if (error?.name === 'OverconstrainedError' || error?.name === 'ConstraintNotSatisfiedError') {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setCameraStream(fallbackStream);
          return;
        } catch (fallbackError) {
          const message = getCameraErrorMessage(fallbackError);
          setCameraError(message);
          setUploadError(message);
          return;
        }
      }
      const message = getCameraErrorMessage(error);
      setCameraError(message);
      setUploadError(message);
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
    }
    setCameraOpen(false);
    setCameraError('');
    setCameraStream(null);
  };

  const capturePhoto = async () => {
    if (!cameraStream || !videoRef.current) return;

    const videoElement = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 1280;
    canvas.height = videoElement.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setCameraError('Não foi possível capturar a foto.');
      return;
    }
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg'));
    if (!blob) {
      setCameraError('Não foi possível capturar a foto.');
      return;
    }

    const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    addPhotos([file]);
    closeCamera();
  };

  const handleFileSelection = async (files) => {
    setUploadError('');
    const selectedFiles = Array.from(files || []);
    if (!selectedFiles.length) return;

    const images = selectedFiles.filter((file) => file.type.startsWith('image/'));
    const videos = selectedFiles.filter((file) => file.type.startsWith('video/'));

    if (images.length && videos.length) {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    if (videos.length > 1 || selectedFiles.length > 1 && videos.length === 1) {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    if (images.length) {
      addPhotos(images);
      return;
    }

    if (videos.length === 1) {
      await addVideo(videos[0]);
      return;
    }

    setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
  };

  const addPhotos = (files) => {
    setUploadError('');
    const selected = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (!selected.length) return;

    if (currentMediaType === 'video') {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    if (previewItems.length + selected.length > MAX_PHOTOS) {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    const newItems = selected.map(createPreviewItem).filter(Boolean);
    newItems.forEach((item) => {
      if (item.objectUrl) createdObjectUrls.current.push(item.objectUrl);
    });
    setPreviewItems((prev) => [...prev, ...newItems]);
  };

  const addVideo = async (file) => {
    setUploadError('');
    if (!file || !file.type.startsWith('video/')) return;

    if (previewItems.length > 0) {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    if (file.size === 0) {
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
      return;
    }

    const src = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = src;

    const revoke = () => {
      URL.revokeObjectURL(src);
    };

    const metadataPromise = new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error('Não foi possível ler o vídeo')); 
    });

    try {
      const duration = await metadataPromise;
      if (duration > MAX_VIDEO_SECONDS) {
        revoke();
        setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
        return;
      }
      const item = { id: `${file.name}-${file.size}-${file.lastModified}`, file, src, type: 'video', objectUrl: src };
      createdObjectUrls.current.push(src);
      setPreviewItems([item]);
    } catch (err) {
      revoke();
      setUploadError('É permitido anexar no máximo 5 fotos ou 1 vídeo de até 10 segundos.');
    }
  };


  const handleRemoveItem = (id) => {
    setPreviewItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      const removed = prev.find((item) => item.id === id);
      if (removed?.objectUrl) {
        URL.revokeObjectURL(removed.objectUrl);
        createdObjectUrls.current = createdObjectUrls.current.filter((url) => url !== removed.objectUrl);
      }
      return next;
    });
  };

  const previewError = uploadError || null;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Controller
        name="descricao"
        control={control}
        render={({ field }) => (
          <TextField
            label="Descrição"
            fullWidth
            multiline
            rows={4}
            error={!!errors.descricao}
            helperText={errors.descricao?.message}
            {...field}
          />
        )}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Controller
            name="local"
            control={control}
            render={({ field }) => (
              <TextField
                label="Local"
                select
                fullWidth
                error={!!errors.local}
                helperText={errors.local?.message}
                value={field.value ?? ''}
                {...field}
              >
                {LOCAL_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}> {option} </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Controller
            name="setor"
            control={control}
            render={({ field }) => (
              <TextField
                label="Setor"
                select
                fullWidth
                error={!!errors.setor}
                helperText={errors.setor?.message}
                value={field.value ?? ''}
                {...field}
              >
                {SETOR_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}> {option} </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Grid>
      </Grid>

      <Controller
        name="prioridade"
        control={control}
        render={({ field }) => (
          <TextField
            label="Prioridade"
            select
            fullWidth
            error={!!errors.prioridade}
            helperText={errors.prioridade?.message}
            value={field.value ?? ''}
            {...field}
          >
            {PRIORIDADE_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}> {option} </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="subtitle1">Fotos/Vídeo</Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button variant="outlined" startIcon={<AddPhotoAlternateIcon />} onClick={openFileDialog}>
            Adicionar Fotos/Vídeo
          </Button>
          <Button
            variant="outlined"
            onClick={openCamera}
            disabled={currentMediaType === 'video'}
          >
            📷 Câmera
          </Button>
        </Box>
        {currentMediaType === 'video' && (
          <Typography color="error" sx={{ mt: 1 }}>
            Não é possível adicionar fotos quando já existe um vídeo anexado.
          </Typography>
        )}
        {previewError && <Typography color="error">{previewError}</Typography>}

        <Dialog open={cameraOpen} onClose={closeCamera} fullWidth maxWidth="sm">
          <DialogTitle>Capturar Foto</DialogTitle>
          <DialogContent>
            {cameraError ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Typography color="error">{cameraError}</Typography>
                  <Typography variant="body2">
                    Você pode selecionar uma foto da galeria como alternativa.
                  </Typography>
                </Box>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ width: '100%', minHeight: 320, borderRadius: 8, backgroundColor: '#000', display: 'block' }}
                />
              )}
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCamera}>Cancelar</Button>
            <Button variant="contained" onClick={capturePhoto} disabled={!cameraStream || !!cameraError}>
              Capturar Foto
            </Button>
          </DialogActions>
        </Dialog>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          capture="environment"
          multiple
          hidden
          onChange={async (e) => {
            if (e.target.files) await handleFileSelection(e.target.files);
            e.target.value = '';
          }}
        />

        {previewItems.length > 0 && (
          <Grid container spacing={1} sx={{ mt: 1 }}>
            {previewItems.map((item) => (
              <Grid item xs={12} sm={previewItems.length === 1 ? 12 : 6} key={item.id}>
                <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                  {item.type === 'image' ? (
                    <img src={item.src} alt="Prévia" style={{ width: '100%', display: 'block' }} />
                  ) : (
                    <Box sx={{ position: 'relative' }}>
                      <video src={item.src} controls style={{ width: '100%', display: 'block' }} />
                    </Box>
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveItem(item.id)}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper', boxShadow: 1 }}
                    aria-label="Remover mídia"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" type="submit" disabled={isSubmitting}>
          Salvar
        </Button>
      </Box>
    </Box>
  );
};

export default OcorrenciaForm;

