/* eslint-disable react/prop-types */
import { Avatar } from 'antd';
import React from 'react';

export const Account: React.FC = () => {
  return (
    <div className="px-4">
      <div className="flex justify-center border-b-[1px] py-6 border-[rgba(255,255,255,0.5)]">
        <button className="bg-transparent">
          <Avatar size="large" className="bg-gray-900">
            登录
          </Avatar>
        </button>
      </div>
    </div>
  );
};
