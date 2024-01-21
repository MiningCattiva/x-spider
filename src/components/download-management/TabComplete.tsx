/* eslint-disable react/prop-types */
import React from 'react';
import { DownloadList } from './DownloadList';

export const TabComplete: React.FC = () => {
  return (
    <DownloadList
      filter={(t) => ['complete'].includes(t.status)}
    />
  );
};
