import dotenv from 'dotenv';

dotenv.config();

export const APP_CONFIG = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'sua_chave_secreta',
  jwtExpire: process.env.JWT_EXPIRE || '24h',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  passwordResetExpireMinutes: Number(process.env.PASSWORD_RESET_TOKEN_EXPIRE_MINUTES) || 60,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/siga_secult',
  uploadDir: process.env.UPLOAD_DIR || '../uploads',
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024,
};
