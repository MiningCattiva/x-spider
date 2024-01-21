/* eslint-disable react/prop-types */
import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Tabs } from '../components/download-management/Tabs';
import { TabDownloading } from '../components/download-management/TabDownloading';
import { TabError } from '../components/download-management/TabError';
import { TabComplete } from '../components/download-management/TabComplete';

export const DownloadManagement: React.FC = () => {
  return (
    <div className='flex flex-col h-screen overflow-hidden relative'>
      <PageHeader />
      <div className='relative grow h-full overflow-hidden'>
        <Tabs tabs={[
          {
            name: '下载中',
            children: <TabDownloading />,
            countStatus: ['active', 'paused', 'waiting']
          },
          {
            name: '错误',
            children: <TabError />,
            countStatus: ['error']
          },
          {
            name: '已完成',
            children: <TabComplete />,
            countStatus: ['complete']
          }
        ]} />
      </div>
    </div>
  );
};
