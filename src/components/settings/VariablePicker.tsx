/* eslint-disable react/prop-types */
import React from 'react';
import { clipboard } from '@tauri-apps/api';
import { Button, message } from 'antd';
import { REPLACER_MAP } from '../../constants/file-name-template';

export const VariablePicker: React.FC = () => {
  return (
    <section
      id="file-name-template-input-variables"
      aria-label="可用变量"
      className="text-xs bg-gray-100 rounded-sm p-3 text-gray-800 mb-3"
    >
      <details>
        <summary>
          <strong>可用变量</strong>
        </summary>
        <ul className="mt-2">
          {Object.entries(REPLACER_MAP).map(([k, v]) => (
            <li key={k} className="inline-block mr-2 mb-2">
              <Button
                size="small"
                title="点击复制"
                onClick={() => {
                  clipboard.writeText(`%${k}%`).then(() => {
                    message.success('已复制到剪贴板');
                  });
                }}
              >
                %{k}% - {v.desc}
              </Button>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
};
