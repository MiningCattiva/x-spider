/* eslint-disable react/prop-types */
import { ConfigProvider } from 'antd';
import React from 'react';
import { ANTD_THEME } from './constants/antd-theme';
import { SideBar } from './components/SideBar';
import { useRouteStore } from './stores/route-store';

export const App: React.FC = () => {
  const currentRoute = useRouteStore((state) => state.route);
  return (
    <ConfigProvider theme={ANTD_THEME} autoInsertSpaceInButton={false}>
      <div className="css-var-r1 select-none text-gray-800 relative w-screen h-screen flex flex-col overflow-hidden">
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
      </div>
    </ConfigProvider>
  );
};
