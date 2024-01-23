/* eslint-disable react/prop-types */
import React from 'react';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/settings/Section';
import { Item } from '../components/settings/Item';
import { DownloadOutlined, GlobalOutlined } from '@ant-design/icons';
import Joi from 'joi';
import { SavePathSelector } from '../components/settings/SavePathSelector';
import { Input, Switch } from 'antd';
import { FileNameTemplateInput } from '../components/settings/FileNameTemplateInput';

export const Settings: React.FC = () => {
  return (
    <>
      <PageHeader />
      <Section title="下载" name="download" titleIcon={<DownloadOutlined />}>
        <Item
          validator={(value) => {
            return Joi.string().required().validate(value).error?.message;
          }}
          label="保存路径"
          settingKey="savePath"
        >
          <SavePathSelector required />
        </Item>
        <Item
          settingKey="fileNameTemplate"
          label="文件名格式"
          description="文件名中的非法字符将会被自动替换"
          validator={(val) => {
            return Joi.string().required().validate(val).error?.message;
          }}
        >
          <FileNameTemplateInput />
        </Item>
        <Item
          settingKey="sameFileSkip"
          label="跳过相同文件"
          valuePropName="checked"
          description="存在同名文件时，是否跳过下载"
        >
          <Switch />
        </Item>
      </Section>
      <Section title="代理" name="proxy" titleIcon={<GlobalOutlined />}>
        <Item label="启用代理" settingKey="enable" valuePropName="checked">
          <Switch />
        </Item>
        <Item
          label="代理地址"
          settingKey="url"
          validator={(val) => {
            return Joi.string()
              .uri({
                scheme: ['http'],
              })
              .message('代理地址格式不正确，示例：“http://127.0.0.1:7890”')
              .validate(val).error?.message;
          }}
        >
          <Input placeholder="代理地址，例如：“http://127.0.0.1:7890”" />
        </Item>
      </Section>
    </>
  );
};
