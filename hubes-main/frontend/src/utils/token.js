const ACCESS_TOKEN_KEY = 'token';
const REFRESH_TOKEN_KEY = 'refreshToken';

export const getToken = () => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const getRefreshToken = () => {
  try {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  } catch (e) {}
};

export const setRefreshToken = (refreshToken) => {
  try {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } catch (e) {}
};

export const clearToken = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  } catch (e) {}
};

export const clearRefreshToken = () => {
  try {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch (e) {}
};

export const clearTokens = () => {
  clearToken();
  clearRefreshToken();
};
