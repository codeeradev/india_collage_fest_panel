import { useEffect } from 'react';

import { logout, getToken, isTokenExpired } from './auth';

export function useAuth() {
  useEffect(() => {
    const token = getToken();

    if (!token || isTokenExpired(token)) {
      logout();
      return;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const timeout = payload.exp * 1000 - Date.now();

    setTimeout(() => {
      logout();
    }, timeout);
  }, []);
}
