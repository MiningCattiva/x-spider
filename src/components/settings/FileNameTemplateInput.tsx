/* eslint-disable react/prop-types */
import { clipboard } from '@tauri-apps/api';
import { Button, Input, message } from 'antd';
import React from 'react';
import {
  EXAMPLE_FILE_NAME_TEMPLATE_DATA,
  REPLACER_MAP,
} from '../../constants/file-name-template';
import { buildFileName } from '../../utils/file-name-template';

export interface FileNameTemplateInputProps {
  value?: string;
  onChange?: (value: string) => void;
}

export const FileNameTemplateInput: React.FC<FileNameTemplateInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div>
      <section
        id="file-name-template-input-variables"
        aria-label="可用变量"
        className="text-xs bg-gray-100 rounded-sm p-3 text-gray-800 mb-3"
      >
        <p>
          <strong>可用变量：</strong>
        </p>
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
      </section>
      <Input
        placeholder="请输入文件名格式"
        aria-describedby="file-name-template-input-variables"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <section className="text-gray-600 text-xs mt-4">
        <strong>输出示例：</strong>
        <span>
          {buildFileName(value || '', EXAMPLE_FILE_NAME_TEMPLATE_DATA)}
        </span>
      </section>
    </div>
  );
};
