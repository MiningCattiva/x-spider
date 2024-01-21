/* eslint-disable react/prop-types */
import React from 'react';
import { DownloadList } from './DownloadList';

export const TabComplete: React.FC = () => {
  return (
    <DownloadList
      batchActions={['deleteAll']}
      filter={(t) => ['complete'].includes(t.status)}
    />
  );
};
