/* eslint-disable react/prop-types */
import { CloseCircleFilled, LoadingOutlined } from '@ant-design/icons';
import { useMount } from 'ahooks';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import React from 'react';
import { SideBar } from './components/SideBar';
import { ANTD_THEME } from './constants/antd-theme';
import { useBootstrap } from './hooks/useBootstrap';
import { useRunBackgroundTasks } from './hooks/useRunBackgroundTasks';
import { useAppStateStore } from './stores/app-state';
import { useRouteStore } from './stores/route';
import { useSettingsStore } from './stores/settings';

const AppInternal: React.FC = () => {
  const currentRoute = useRouteStore((state) => state.route);

  useMount(() => {
    log.info('Settings', useSettingsStore.getState());
    const appState = useAppStateStore.getState();
    log.info('AppStates', {
      ...appState,
      cookieString: appState.cookieString ? '******' : '[empty]',
    });
  });

  useRunBackgroundTasks();

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
  const { ready, error } = useBootstrap();

  return (
    <ConfigProvider
      theme={ANTD_THEME}
      autoInsertSpaceInButton={false}
      locale={zhCN}
    >
      <AntApp>
        <div className="css-var-r0 select-none text-gray-800 relative w-screen h-screen flex flex-col overflow-hidden">
          {!ready && (
            <div className="w-screen h-screen flex flex-col items-center justify-center">
              {!error && (
                <>
                  <LoadingOutlined className="text-5xl text-ant-color-primary" />
                  <p className="mt-4 text-xl">应用启动中，请稍候...</p>
                </>
              )}
              {error && (
                <>
                  <CloseCircleFilled className="text-5xl text-ant-color-error" />
                  <p className="mt-4 text-xl">应用启动失败，请尝试重启应用</p>
                  <p className="text-gray-600 mt-2">{error || '未知错误'}</p>
                </>
              )}
            </div>
          )}
          {ready && <AppInternal />}
        </div>
      </AntApp>
    </ConfigProvider>
  );
};
