import { usePollSystemProxyUrl } from './background-tasks/usePollSystemProxyUrl';
import { useAriaBinding } from './background-tasks/useAriaBinding';
import { useTaskNotifications } from './background-tasks/useTaskNotifications';
import { useAutoCheckUpdate } from './background-tasks/useAutoCheckUpdate';

export function useRunBackgroundTasks() {
  useTaskNotifications();
  useAutoCheckUpdate();
  usePollSystemProxyUrl();
  useAriaBinding();
}
