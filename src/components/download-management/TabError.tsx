/* eslint-disable react/prop-types */
import React from 'react';
import { DownloadList } from './DownloadList';

export const TabError: React.FC = () => {
  return (
    <DownloadList
      batchActions={['redownloadAll', 'deleteAll']}
      filter={(t) => ['error'].includes(t.status)}
    />
  );
};
