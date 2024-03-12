/* eslint-disable react/prop-types */
import { useRequest } from 'ahooks';
import React from 'react';
import { request } from '../../ipc/network';

export const Sponsors: React.FC = () => {
  const { data, loading } = useRequest(
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
    <a
      href="https://afdian.net/a/moyuscript"
      target="_blank"
      rel="noreferrer"
      title="跳转到赞助页"
      className="block bg-[#946ce6] rounded-md mt-2 p-4 !no-underline hover:text-[color:initial] group"
    >
      <h2 className="text-white flex items-center font-bold text-2xl justify-center  ">
        <img
          className="w-12 mr-2 group-hover:rotate-[1turn] transition-transform duration-500"
          src="https://afdian.net/static/img/logo/afdian_logo.png"
          alt="爱发电LOGO"
        />
        <span>爱发电</span>
      </h2>
      <div className="mt-4 p-2 bg-white rounded-md">
        <ul className="flex space-x-2 ">
          {data &&
            data.list.map((item: any) => (
              <li
                key={item.id}
                title={item.name}
                className="flex items-center bg-white p-2 border-[1px] rounded-full"
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
        {loading && !data && <span>加载名单中...</span>}
      </div>
    </a>
  );
};
