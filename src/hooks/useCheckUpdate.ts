import { useLockFn } from 'ahooks';
import { useAppStateStore } from '../stores/app-state';
import { getLatestRelease } from '../github/api';
import { message } from 'antd';
import { isVersionGt } from '../utils/version';
import { dialog, shell } from '@tauri-apps/api';

export function useCheckUpdate() {
  const { setLatestVersion, setLatestUrl, setLastCheckUpdateTime } =
    useAppStateStore((s) => ({
      setLatestVersion: s.setLatestVersion,
      setLatestUrl: s.setLatestUrl,
      setLastCheckUpdateTime: s.setLastCheckUpdateTime,
    }));
  return useLockFn(async () => {
    try {
      const release = await getLatestRelease();
      setLastCheckUpdateTime(Date.now());

      const latestVersion = release.tag_name.slice(1) as string;
      if (isVersionGt(latestVersion, PACKAGE_JSON_VERSION)) {
        setLatestVersion(latestVersion);
        setLatestUrl(release.html_url);
        dialog
          .ask('软件有最新版本，是否前往下载？', {
            title: '更新提示',
            okLabel: '现在就去',
            cancelLabel: '下次一定',
          })
          .then((result) => {
            if (result) {
              shell.open(release.html_url);
            }
          });
        return true;
      }
    } catch (err: any) {
      console.error(err);
      message.error(err.message);
    }
    return false;
  });
}
