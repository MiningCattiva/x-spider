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
            return Joi.string()
              .pattern(
                // eslint-disable-next-line
                /^([a-z]:)((\\[a-z0-9^&'@{}\[\],$=!\-#\(\)%\.\+~_]+)*\\)([^\\\/:\*\"<>\|]+(\.[a-z0-9]+)?)$/i,
              )
              .message(
                '路径有误，请检查路径是否正确，路径不能以 \\ 结尾且文件（夹）名不能包含以下字符：? * / \\ < > : " |',
              )
              .messages({
                'string.empty': '请填写保存路径模板',
              })
              .validate(value).error?.message;
          }}
          label="保存路径模板"
          settingKey="savePath"
        >
          <SavePathSelector required />
        </Item>
        <Item
          settingKey="fileNameTemplate"
          label="文件名模板"
          description="文件名中的非法字符将会被自动替换"
          validator={(value) => {
            return Joi.string()
              .messages({
                'string.empty': '请填写保存文件名模板',
              })
              .validate(value).error?.message;
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
          label="使用系统代理"
          settingKey="useSystem"
          valuePropName="checked"
          description="自动使用系统代理，如果代理未生效，可能是你的代理软件没有自动设置系统代理，此时请手动配置代理地址。"
        >
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
      <Section title="应用" name="app">
        <Item
          label="自动检查更新"
          settingKey="autoCheckUpdate"
          valuePropName="checked"
        >
          <Switch />
        </Item>
        <Item
          label="接收预览版"
          description="预览版更新更频繁，能获取到最新的特性，但不太稳定，可能会出现各种错误。"
          settingKey="acceptPrerelease"
          valuePropName="checked"
        >
          <Switch />
        </Item>
      </Section>
    </>
  );
};
