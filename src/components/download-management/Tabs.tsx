/* eslint-disable react/prop-types */
import React, { useEffect } from 'react';
import { useDownloadStore } from '../../stores/download';
import clsx from 'clsx';
import { Aria2Status } from '../../utils/aria2';
import * as R from 'ramda';
import { DownloadTask } from '../../interfaces/DownloadTask';

export interface Tab {
  name: string;
  children: React.ReactNode;
  countStatus: Aria2Status[];
}

export interface TabsProps {
  tabs: Tab[];
}

export const Tabs: React.FC<TabsProps> = ({ tabs }) => {
  const { currentTab, setCurrentTab, downloadTasks } = useDownloadStore(
    (s) => ({
      currentTab: s.currentTab,
      setCurrentTab: s.setCurrentTab,
      downloadTasks: s.downloadTasks,
    }),
  );

  useEffect(() => {
    if (!currentTab) {
      setCurrentTab(tabs[0].name);
    }
  }, [currentTab, tabs]);

  const currentTabChildren = tabs.find(
    (tab) => tab.name === currentTab,
  )?.children;

  return (
    <div className="h-full flex flex-col">
      <ul role="tablist" className="flex space-x-6">
        {tabs.map((tab) => (
          <li key={tab.name} className="w-">
            <div className="relative">
              {tab.name === currentTab && (
                <div className="absolute w-full h-2 rounded-full bg-ant-color-primary left-0 bottom-0" />
              )}
              <button
                aria-selected={tab.name === currentTab}
                role="tab"
                onClick={() => setCurrentTab(tab.name)}
                className={clsx(
                  'bg-transparent text-xl relative transition-colors hover:text-ant-color-primary',
                  tab.name === currentTab && 'font-bold !text-black',
                )}
              >
                {tab.name}
                <span>
                  (
                  {R.count<DownloadTask>((t) =>
                    tab.countStatus.includes(t.status),
                  )(downloadTasks)}
                  )
                </span>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div
        role="tabpanel"
        aria-label={currentTab}
        className="mt-4 grow relative overflow-hidden"
      >
        {currentTabChildren}
      </div>
    </div>
  );
};
