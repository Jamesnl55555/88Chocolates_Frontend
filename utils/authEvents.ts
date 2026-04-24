let logoutHandler: null | (() => void) = null;

export const setLogoutHandler = (fn: () => void) => {
  logoutHandler = fn;
};

export const triggerLogout = () => {
  logoutHandler?.();
};