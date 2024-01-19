/* eslint-disable react/prop-types */
import React from 'react';
import { useRouteStore } from '../stores/route';

export const PageHeader: React.FC = () => {
  const currentRoute = useRouteStore((state) => state.route);

  if (!currentRoute) return null;

  return (
    <div className="pt-8 pb-4">
      <h1 className="font-bold flex items-center leading-none pb-4 border-ant-color-primary border-b-[1px]">
        <span
          aria-hidden
          className="text-xl text-ant-color-primary border-ant-color-primary items-center flex justify-center border-2 w-10 h-10 rounded-full"
        >
          {currentRoute.icon}
        </span>
        <span className="ml-3 text-3xl -translate-y-[0.1rem]">
          {currentRoute.name}
        </span>
      </h1>
    </div>
  );
};
