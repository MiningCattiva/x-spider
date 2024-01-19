/* eslint-disable react/prop-types */
import { Avatar, Form, Input, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAppStateStore } from '../stores/app-state';
import { getAccountInfo } from '../twitter/api';
import { TwitterAccountInfo } from '../interfaces/TwitterAccountInfo';
import { LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import FormItem from 'antd/es/form/FormItem';
import { useForm } from 'antd/es/form/Form';
import { stringifyCookie } from '../utils/cookie';

export const Account: React.FC = () => {
  const [cookieString, setCookieString] = useAppStateStore((state) => [
    state.cookieString,
    state.setCookieString,
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<TwitterAccountInfo | null>(
    null,
  );
  const [form] = useForm();

  useEffect(() => {
    (async () => {
      if (!cookieString) {
        setAccountInfo(null);
      } else {
        try {
          const accountInfo = await getAccountInfo(cookieString);
          setAccountInfo(accountInfo);
        } catch (err: any) {
          message.error('获取账号信息失败');
          console.error(err);
        }
      }
    })();
  }, [cookieString]);

  const onFormFinished = async (values: any) => {
    setModalLoading(true);
    const newCookieString = stringifyCookie(values);

    try {
      const accountInfo = await getAccountInfo(newCookieString);
      setAccountInfo(accountInfo);
      setModalOpen(false);
      setCookieString(newCookieString);
    } catch (err: any) {
      console.error(err);
      message.error('无法登录，请检测 CookieString 是否正确');
    } finally {
      setModalLoading(false);
    }
  };

  const onModalOk = async () => {
    form.submit();
  };

  return (
    <>
      <div className="px-4">
        <section
          aria-label="个人信息"
          className="flex flex-col justify-center items-center border-b-[1px] py-6 border-[rgba(255,255,255,0.5)]"
        >
          {!accountInfo && (
            <button
              className="bg-transparent"
              onClick={() => setModalOpen(true)}
            >
              <Avatar size={50}>登录</Avatar>
            </button>
          )}
          {accountInfo && (
            <>
              <a
                title="前往个人主页"
                aria-label="前往个人主页"
                target="_blank"
                href={`https://twitter.com/${accountInfo.screenName}`}
                rel="noreferrer"
              >
                <Avatar size={50} src={accountInfo.avatar} alt="头像" />
              </a>
              <div className="text-white mt-1 font-bold">
                {accountInfo.screenName}
              </div>
              <div>
                <button
                  onClick={() => {
                    setCookieString('');
                  }}
                  className="text-white bg-transparent hover:text-gray-200 transition-colors text-sm"
                >
                  <LogoutOutlined aria-hidden />
                  <span className="ml-1">登出</span>
                </button>
              </div>
            </>
          )}
        </section>
      </div>
      <Modal
        onOk={onModalOk}
        confirmLoading={modalLoading}
        onCancel={() => setModalOpen(false)}
        open={modalOpen}
        title="设置 Twitter 的 Cookie"
      >
        <Form
          labelCol={{ span: 5 }}
          form={form}
          className="mt-4"
          onFinish={onFormFinished}
        >
          <FormItem
            name="auth_token"
            label="auth_token"
            rules={[
              {
                type: 'string',
                required: true,
              },
            ]}
          >
            <Input placeholder="名称为 auth_token 的值" />
          </FormItem>
          <FormItem
            name="ct0"
            label="ct0"
            rules={[
              {
                type: 'string',
                required: true,
              },
            ]}
          >
            <Input placeholder="名称为 ct0 的值" />
          </FormItem>
        </Form>
        <p className="mt-2">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noreferrer"
            className="text-ant-color-link flex items-center"
          >
            <QuestionCircleOutlined
              className="transform translate-y-[0.6px]"
              aria-hidden
            />
            <span className="ml-1">寻找 CookieString 的方法</span>
          </a>
        </p>
      </Modal>
    </>
  );
};
