/* eslint-disable react/prop-types */
import React from 'react';
import { useHomepageStore } from '../../stores/homepage';
import {
  Button,
  Checkbox,
  DatePicker,
  Form,
  Space,
  Tooltip,
  message,
} from 'antd';
import dayjs from 'dayjs';
import { useDownloadStore } from '../../stores/download';
import MediaType from '../../enums/MediaType';
import { QuestionCircleOutlined } from '@ant-design/icons';

export const DownloadController: React.FC = () => {
  const { filter, setFilter, user, loadPostList } = useHomepageStore((s) => ({
    filter: s.filter,
    setFilter: s.setFilter,
    user: s.userInfo.data,
    loadPostList: s.loadPostList,
  }));
  const { createCreationTask } = useDownloadStore((s) => ({
    createCreationTask: s.createCreationTask,
  }));

  const onStartDownload = async () => {
    if (!user) {
      message.error('请先加载用户');
      return;
    }

    if (!filter.mediaTypes || filter.mediaTypes.length === 0) {
      message.error('请至少选择一个媒体类型');
      return;
    }

    try {
      createCreationTask(user, filter);
      message.success('已成功创建下载任务，请到下载管理页查看');
    } catch (err: any) {
      console.error(err);
      message.error('创建下载任务失败');
    }
  };

  return (
    <section className="p-4 bg-white rounded-md mt-3 border-[1px]">
      <h2 className="font-bold mb-4">下载配置</h2>
      <Form
        layout="inline"
        initialValues={filter}
        onValuesChange={(_, values) => {
          setFilter(values);
        }}
      >
        <Form.Item name="dateRange" label="日期范围">
          <DatePicker.RangePicker
            presets={[
              {
                label: '至今',
                value: [dayjs.unix(0), dayjs()],
              },
              {
                label: '最近 7 天',
                value: [dayjs().subtract(7, 'day'), dayjs()],
              },
              {
                label: '最近 15 天',
                value: [dayjs().subtract(15, 'day'), dayjs()],
              },
              {
                label: '最近 1 个月',
                value: [dayjs().subtract(1, 'month'), dayjs()],
              },
              {
                label: '最近 6 个月',
                value: [dayjs().subtract(6, 'month'), dayjs()],
              },
              {
                label: '最近 1 年',
                value: [dayjs().subtract(1, 'year'), dayjs()],
              },
            ]}
            disabledDate={(cur) => cur && cur > dayjs().endOf('day')}
          />
        </Form.Item>
        <Form.Item name="mediaTypes" label="媒体类型">
          <Checkbox.Group
            options={[
              {
                label: '视频',
                value: MediaType.Video,
              },
              {
                label: '照片',
                value: MediaType.Photo,
              },
              {
                label: 'GIF',
                value: MediaType.Gif,
              },
            ]}
          />
        </Form.Item>
      </Form>
      <hr className="my-4" />
      <section className="flex space-x-2">
        <Button type="primary" onClick={onStartDownload}>
          <Space>
            <span>开始下载</span>
            <Tooltip title="由于推特限制，更早的媒体可能无法下载到。">
              <QuestionCircleOutlined />
            </Tooltip>
          </Space>
        </Button>
        <Button
          onClick={() => {
            loadPostList();
          }}
        >
          刷新列表
        </Button>
      </section>
    </section>
  );
};
