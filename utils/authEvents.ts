type LogoutType = 'manual' | 'expired' | 'invalid';

let logoutHandler: ((type?: LogoutType) => void) | null = null;

export const setLogoutHandler = (fn: (type?: LogoutType) => void) => {
  logoutHandler = fn;
};

export const triggerLogout = (type?: LogoutType) => {
  logoutHandler?.(type);
};