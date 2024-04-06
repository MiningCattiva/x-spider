/* eslint-disable react/prop-types */
import React from 'react';
import { clipboard } from '@tauri-apps/api';
import { Button, Tooltip, message } from 'antd';
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
              <Tooltip
                title={
                  v.params ? (
                    <div>
                      <p>参数列表：</p>
                      <ul>
                        {v.params.map((param) => (
                          <li key={param.name}>
                            <strong>{param.name}</strong>
                            <span>：</span>
                            <span>{param.desc}</span>
                            <span>（默认：{param.default}）</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : undefined
                }
              >
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
              </Tooltip>
            </li>
          ))}
        </ul>
        <p>
          参数格式：%VARIABLE,a=1,b=2%，如 %CONTENT,t=32% 代表推文内容截断 32
          字符。
        </p>
      </details>
    </section>
  );
};
