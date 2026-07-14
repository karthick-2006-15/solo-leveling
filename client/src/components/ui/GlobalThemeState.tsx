import { useEffect } from 'react';
import { useMonarch } from '../../hooks/useMonarch';

export const GlobalThemeState = () => {
  const { monarchData } = useMonarch();

  useEffect(() => {
    if (!monarchData?.attributes) return;

    const { corruption, willpower } = monarchData.attributes;

    // Reset classes
    document.body.classList.remove('theme-corrupted', 'theme-monarch');

    if (corruption >= 80) {
      document.body.classList.add('theme-corrupted');
    } else if (willpower >= 80) {
      document.body.classList.add('theme-monarch');
    }
  }, [monarchData?.attributes]);

  return null;
};
