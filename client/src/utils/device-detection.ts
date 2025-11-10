export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  const userAgent = navigator.userAgent || navigator.vendor;
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;

  const isSmallScreen = window.innerWidth < 768;
  const hasTouchSupport =
    'ontouchstart' in window || navigator.maxTouchPoints > 0;

  return mobileRegex.test(userAgent) || (isSmallScreen && hasTouchSupport);
};
