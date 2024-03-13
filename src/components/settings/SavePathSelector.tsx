/* eslint-disable react/prop-types */
import { dialog } from '@tauri-apps/api';
import { Button, Input, InputProps, Space } from 'antd';
import React from 'react';
import { showInFolder } from '../../utils/shell';

export type SavePathSelectorProps = InputProps;

export const SavePathSelector: React.FC<SavePathSelectorProps> = ({
  value,
  onChange,
  ...props
}) => {
  return (
    <section>
      <Space.Compact block>
        <Input value={value} onChange={onChange} readOnly {...props} />
        <Button
          onClick={() => {
            showInFolder(value as string);
          }}
        >
          打开
        </Button>
        <Button
          type="primary"
          onClick={async () => {
            const result = await dialog.open({
              defaultPath: value?.toString(),
              title: '选择保存路径',
              directory: true,
            });

            if (!result) return;
            onChange?.({
              // @ts-ignore
              target: {
                value: result as string,
              },
            });
          }}
        >
          选择路径
        </Button>
      </Space.Compact>
    </section>
  );
};
