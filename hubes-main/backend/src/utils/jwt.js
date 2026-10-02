import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { APP_CONFIG } from '../config/appConfig.js';

const SECRET = APP_CONFIG.jwtSecret;
const ACCESS_EXPIRE = APP_CONFIG.jwtExpire;
const REFRESH_EXPIRE = APP_CONFIG.jwtRefreshExpire;
const PASSWORD_RESET_EXPIRE = `${APP_CONFIG.passwordResetExpireMinutes}m`;

export const generateAccessToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: 'access' }, SECRET, { expiresIn: ACCESS_EXPIRE });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: 'refresh' }, SECRET, { expiresIn: REFRESH_EXPIRE });
};

export const generatePasswordResetToken = (payload) => {
  return jwt.sign({ ...payload, tokenType: 'passwordReset' }, SECRET, { expiresIn: PASSWORD_RESET_EXPIRE });
};

const verify = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (error) {
    return null;
  }
};

export const verifyAccessToken = (token) => {
  const decoded = verify(token);
  return decoded?.tokenType === 'access' ? decoded : null;
};

export const verifyRefreshToken = (token) => {
  const decoded = verify(token);
  return decoded?.tokenType === 'refresh' ? decoded : null;
};

export const verifyPasswordResetToken = (token) => {
  const decoded = verify(token);
  return decoded?.tokenType === 'passwordReset' ? decoded : null;
};

export const decodeToken = (token) => {
  return jwt.decode(token);
};

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
