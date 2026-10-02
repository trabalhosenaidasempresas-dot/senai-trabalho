import React, { useEffect, useRef, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Box, Typography, Stack } from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import FlipCameraAndroidIcon from '@mui/icons-material/FlipCameraAndroid';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';

const CameraCapture = ({ onCapture, currentFile, label = 'Foto', buttonLabel = 'Capturar foto', accept = 'image/*' }) => {
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [facingMode, setFacingMode] = useState('environment');
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
      setError('');
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Câmera não suportada neste dispositivo.');
      return;
    }

    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (cameraError) {
        setError('Não foi possível acessar a câmera. Por favor, permita o acesso ou use o seletor de arquivos.');
      }
    };

    startCamera();
  }, [open, facingMode]);

  useEffect(() => {
    if (capturedFile) {
      const url = URL.createObjectURL(capturedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [capturedFile]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCapturedFile(null);
    setError('');
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `captura-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setCapturedFile(file);
    }, 'image/jpeg', 0.95);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      handleClose();
    }
  };

  const handleFileSelection = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
  };

  const toggleFacingMode = () => {
    setFacingMode((current) => (current === 'environment' ? 'user' : 'environment'));
  };

  return (
    <>
      <Button startIcon={<CameraAltIcon />} variant="outlined" onClick={handleOpen}>
        {buttonLabel}
      </Button>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{label}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {error ? (
              <Typography color="error">{error}</Typography>
            ) : (
              <Box sx={{ position: 'relative', width: '100%', minHeight: 260, bgcolor: '#00000010', borderRadius: 1, overflow: 'hidden' }}>
                {!capturedFile ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <Box component="img" src={previewUrl} alt="Foto capturada" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                )}
                <canvas ref={canvasRef} style={{ display: 'none' }} />
              </Box>
            )}

            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button variant="outlined" startIcon={<FlipCameraAndroidIcon />} onClick={toggleFacingMode} disabled={!!error}>
                Alternar câmera
              </Button>
              <Button variant="contained" onClick={handleCapture} disabled={!!error || !!capturedFile}>
                Capturar
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhotoLibraryIcon />}
                onClick={() => fileInputRef.current?.click()}
              >
                Selecionar arquivo
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                style={{ display: 'none' }}
                onChange={handleFileSelection}
              />
            </Stack>

            {capturedFile && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Pré-visualização</Typography>
                <Typography variant="body2">{capturedFile.name}</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!capturedFile} variant="contained">
            Usar foto
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CameraCapture;
