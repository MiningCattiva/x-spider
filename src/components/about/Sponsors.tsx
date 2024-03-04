/* eslint-disable react/prop-types */
import { useRequest } from 'ahooks';
import React from 'react';
import { request } from '../../ipc/network';

export const Sponsors: React.FC = () => {
  const { data } = useRequest(
    async () => {
      const res = await request({
        method: 'GET',
        responseType: 'json',
        url: 'https://github.com/MiningCattiva/sponsors/raw/main/sponsors.json',
      });

      return res.body;
    },
    {
      cacheKey: 'sponsors',
      cacheTime: -1,
    },
  );

  return (
    <ul className="mt-2 flex space-x-2 p-2 max-h-80 overflow-y-auto">
      {data &&
        data.list.map((item: any) => (
          <li
            key={item.id}
            title={item.name}
            className="flex items-center bg-white p-2 border-[1px] rounded-full hover:scale-105 transition-all"
          >
            <img
              src={item.avatar}
              loading="lazy"
              className="w-6 h-6 rounded-full"
            />
            <span className="ml-1 text-sm">{item.name}</span>
          </li>
        ))}
    </ul>
  );
};
