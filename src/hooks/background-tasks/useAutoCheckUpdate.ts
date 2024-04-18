import { useMount } from 'ahooks';
import { useSettings } from '../useSettings';
import { useCheckUpdate } from '../useCheckUpdate';
import { useAppStateStore } from '../../stores/app-state';
import dayjs from 'dayjs';

export function useAutoCheckUpdate() {
  const { value: autoCheckUpdate } = useSettings<boolean>(
    'app',
    'autoCheckUpdate',
  );
  const lastCheckUpdateTime = useAppStateStore((s) => s.lastCheckUpdateTime);
  const checkUpdate = useCheckUpdate();

  useMount(() => {
    if (!autoCheckUpdate) return;
    if (dayjs(lastCheckUpdateTime).isAfter(dayjs().startOf('day'))) return;

    checkUpdate();
  });
}
