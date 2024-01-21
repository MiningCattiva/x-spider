/* eslint-disable react/prop-types */
import React from 'react';
import { DownloadList } from './DownloadList';

export const TabError: React.FC = () => {
  return (
    <DownloadList
      filter={(t) => ['error'].includes(t.status)}
    />
  );
};
