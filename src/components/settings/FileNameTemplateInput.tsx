/* eslint-disable react/prop-types */

import React from 'react';
import { EXAMPLE_FILE_NAME_TEMPLATE_DATA } from '../../constants/file-name-template';
import { buildFileName } from '../../utils/file-name-template';
import { Input } from 'antd';
import { VariablePicker } from './VariablePicker';

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
      <VariablePicker />
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
