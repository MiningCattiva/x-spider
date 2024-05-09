/* eslint-disable react/prop-types */
import { App, Button, Checkbox, DatePicker, Form, Radio, Space } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import MediaType from '../../enums/MediaType';
import { DownloadFilter } from '../../interfaces/DownloadFilter';
import { useDownloadStore } from '../../stores/download';
import { useHomepageStore } from '../../stores/homepage';
import { useAppStateStore } from '../../stores/app-state';
import { getUser } from '../../twitter/api';
export const DownloadController: React.FC = () => {
  const { message } = App.useApp();
  const { filter, setFilter, user } = useHomepageStore((s) => ({
    filter: s.filter,
    setFilter: s.setFilter,
    user: s.userInfo.data,
  }));
  const { createCreationTask } = useDownloadStore((s) => ({
    createCreationTask: s.createCreationTask,
  }));
  const { searchHistory } =
    useAppStateStore((s) => ({
      searchHistory: s.searchHistory,
    }))

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
      log.error(err);
      message.error('创建下载任务失败');
    }
  };

  const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay));
  const onStartDownload2 = async () => {
    if (!user) {
      message.error('请先加载用户');
      return;
    }

    if (!filter.mediaTypes || filter.mediaTypes.length === 0) {
      message.error('请至少选择一个媒体类型');
      return;
    }
    
      searchHistory.forEach(async (it: any) => {
        try {
          message.info("正在下载: "+it)
          const value = await getUser(it)
          await createCreationTask(value, filter);
          await sleep(12000)
        } catch (err: any) {
          log.error(err);
          message.error('创建下载任务失败');
        }
      })
      message.success('已成功创建下载任务，请到下载管理页查看');
  };

  return (
    <section className="p-4 bg-white rounded-md mt-3 border-[1px]">
      <h2 className="font-bold mb-4">下载配置</h2>
      <Form<DownloadFilter>
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
        <Form.Item
          name="source"
          label="下载源"
          tooltip="帖子能下载到更早的推文，但爬取速度较慢；媒体可能下载不到更早的推文，但爬取速度更快。"
        >
          <Radio.Group
            options={[
              {
                label: '帖子',
                value: 'tweets',
              },
              {
                label: '媒体',
                value: 'medias',
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
          </Space>
        </Button>
        <Button type="primary" onClick={onStartDownload2}>
          <Space>
            <span>一键下载</span>
          </Space>
        </Button>
      </section>
    </section>
  );
};
