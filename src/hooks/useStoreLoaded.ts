import { useState } from 'react';
import { useEvent } from './useEvent';
import { EventEmitter } from '../utils/event';

const map = new Map<EventEmitter, boolean>();

export function useStoreLoaded(storeLoadedEvent: EventEmitter) {
  const [loadedState, setLoadedState] = useState(
    () => map.get(storeLoadedEvent) || false,
  );

  useEvent(
    () => {
      setLoadedState(true);
      map.set(storeLoadedEvent, true);
    },
    storeLoadedEvent,
    [],
  );

  return loadedState;
}
