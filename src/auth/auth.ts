export const TOKEN_KEY = 'accessToken';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const logout = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem('user');
  window.location.href = '/sign-in';
};

export const getTokenPayload = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token: string) => {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return true;
  return payload.exp < Date.now() / 1000;
};
