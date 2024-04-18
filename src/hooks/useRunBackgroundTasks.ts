import { usePollSystemProxyUrl } from './background-tasks/usePollSystemProxyUrl';
import { useSyncSettingsToAria } from './background-tasks/useSyncSettingsToAria';
import { useTaskNotifications } from './background-tasks/useTaskNotifications';
import { useAutoCheckUpdate } from './background-tasks/useAutoCheckUpdate';

export function useRunBackgroundTasks() {
  useTaskNotifications();
  useAutoCheckUpdate();
  usePollSystemProxyUrl();
  useSyncSettingsToAria();
}
