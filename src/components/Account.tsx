/* eslint-disable react/prop-types */
import { Avatar, Form, Input, Modal, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useAppStateStore } from '../stores/app-state';
import { getAccountInfo } from '../twitter/api';
import { TwitterAccountInfo } from '../interfaces/TwitterAccountInfo';
import { LogoutOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import FormItem from 'antd/es/form/FormItem';
import { useForm } from 'antd/es/form/Form';
import { parseCookie, stringifyCookie } from '../utils/cookie';

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

  const cookies = parseCookie(cookieString);

  return (
    <>
      <div className="px-4">
        <section
          aria-label="个人信息"
          className="flex flex-col justify-center items-center border-b-[1px] py-6 border-[rgba(255,255,255,0.5)]"
        >
          {!accountInfo && (
            <>
              <button
                className="bg-transparent"
                onClick={() => setModalOpen(true)}
              >
                <Avatar size={50}>登录</Avatar>
              </button>
              <span className="sr-only" role="alert">
                账号未登录
              </span>
            </>
          )}
          {accountInfo && (
            <>
              <span className="sr-only" role="alert">
                账号 {accountInfo.screenName} 已登录
              </span>
              <a
                className="focus:outline !outline-4 !outline-black"
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
          initialValues={cookies}
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
          <button
            onClick={() => {
              Modal.confirm({
                title: '寻找 CookieString 的方法',
                icon: null,
                content: (
                  <>
                    <p>1. 打开推特并登录。</p>
                    <p>2. 按【F12】打开开发者工具。</p>
                    <p>3. 找到【应用程序（Applications）】选项卡。</p>
                    <p>
                      4.
                      在左侧列表中找到【Cookie】，展开并选中【https://twitter.com】。
                    </p>
                    <p>
                      5.
                      在右侧找到名称为【auth_token】和【ct0】的项目，复制相应值填写表单即可。
                    </p>
                  </>
                ),
              });
            }}
            className="text-ant-color-link flex items-center bg-transparent"
          >
            <QuestionCircleOutlined
              className="transform translate-y-[0.6px]"
              aria-hidden
            />
            <span className="ml-1">寻找 CookieString 的方法</span>
          </button>
        </p>
        {modalLoading && (
          <span className="sr-only" role="status">
            登录中，请稍候
          </span>
        )}
      </Modal>
    </>
  );
};
