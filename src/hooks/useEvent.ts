import { useEffect } from 'react';
import { EventEmitter } from '../utils/event';

export function useEvent<T = void>(
  fn: (data: T) => void,
  emitter: EventEmitter<T>,
  deps: any[],
) {
  useEffect(() => {
    const unlisten = emitter.listen(fn);
    return unlisten;
  }, deps);
}
