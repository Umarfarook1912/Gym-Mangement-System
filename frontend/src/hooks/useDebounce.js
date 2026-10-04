import { useEffect, useState } from 'react';
import { TIME } from '../constants';

export function useDebounce(value, delay = TIME.SEARCH_DEBOUNCE) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
