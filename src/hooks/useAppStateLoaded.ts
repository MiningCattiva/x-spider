import { useState } from 'react';
import { useEvent } from './useEvent';
import { appStateLoadedEvent } from '../events/app-state-loaded';

let loaded = false;
export function useSettingsLoaded() {
  const [loadedState, setLoadedState] = useState(loaded);

  useEvent(
    () => {
      setLoadedState(true);
      loaded = true;
    },
    appStateLoadedEvent,
    [],
  );

  return loadedState;
}
