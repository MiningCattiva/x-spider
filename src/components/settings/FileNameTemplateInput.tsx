/* eslint-disable react/prop-types */

import React from 'react';
import { Input } from 'antd';
import { VariablePicker } from './VariablePicker';
import { TemplateExample } from './TemplateExample';

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
        placeholder="请输入内容，支持使用变量"
        aria-describedby="file-name-template-input-variables"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
      />
      <TemplateExample value={value} />
    </div>
  );
};
