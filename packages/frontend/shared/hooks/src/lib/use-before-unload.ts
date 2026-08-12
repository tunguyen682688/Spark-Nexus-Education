import { useEffect } from 'react';

export function useBeforeUnload(enabled: boolean, id?: string): void {
  useEffect(() => {
    if (!id || !enabled) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [id, enabled]);
}
