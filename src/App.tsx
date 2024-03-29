/* eslint-disable react/prop-types */
import { ConfigProvider } from 'antd';
import React from 'react';
import { ANTD_THEME } from './constants/antd-theme';
import { SideBar } from './components/SideBar';
import { useRouteStore } from './stores/route';
import { useStoreLoaded } from './hooks/useStoreLoaded';
import { settingsLoadedEvent } from './events/settings-loaded';
import { appStateLoadedEvent } from './events/app-state-loaded';
import { LoadingOutlined } from '@ant-design/icons';
import { useTaskNotifications } from './hooks/useTaskNotifications';
import zhCN from 'antd/locale/zh_CN';
import { useAutoCheckUpdate } from './hooks/useAutoCheckUpdate';

const AppInternal: React.FC = () => {
  const currentRoute = useRouteStore((state) => state.route);

  useAutoCheckUpdate();

  return (
    <div className="bg-gray-50 w-full h-full overflow-auto">
      <SideBar />
      <main
        className="w-full overflow-auto transition-all pl-52"
        key={currentRoute?.id}
        aria-label={currentRoute?.name}
      >
        <div className="px-10">{currentRoute?.element}</div>
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  const settingsLoaded = useStoreLoaded(settingsLoadedEvent);
  const appStateLoaded = useStoreLoaded(appStateLoadedEvent);

  const loading = ![settingsLoaded, appStateLoaded].every(Boolean);

  useTaskNotifications();

  return (
    <ConfigProvider
      theme={ANTD_THEME}
      autoInsertSpaceInButton={false}
      locale={zhCN}
    >
      <div className="css-var-r0 select-none text-gray-800 relative w-screen h-screen flex flex-col overflow-hidden">
        {loading && (
          <div className="w-screen h-screen flex flex-col items-center justify-center">
            <LoadingOutlined className="text-5xl text-ant-color-primary" />
            <p className="mt-4 text-xl">应用加载中，请稍候...</p>
          </div>
        )}
        {!loading && <AppInternal />}
      </div>
    </ConfigProvider>
  );
};
