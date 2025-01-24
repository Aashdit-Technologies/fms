import useAuthStore from '../store/Store';

export const checkTokenExpiration = () => {
  const token = useAuthStore.getState().token;
  
  if (!token) return false;

  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) return false;

    const payload = JSON.parse(atob(tokenParts[1]));
    
    if (!payload.exp) return false;

    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    if (currentTime >= expirationTime) {
      useAuthStore.getState().clearAuth();
      sessionStorage.removeItem('token');
      window.location.href = '/';
      return false;
    }

    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

export const setupTokenExpirationChecker = () => {
  setInterval(checkTokenExpiration, 60000);
  
  window.addEventListener('focus', checkTokenExpiration);
};
