export const isIos = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isDispositivoMovel = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 768px), (pointer: coarse)').matches;
