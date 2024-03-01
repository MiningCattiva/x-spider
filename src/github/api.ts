import { request } from '../ipc/network';

export async function getLatestRelease() {
  const resp = await request({
    method: 'GET',
    responseType: 'text',
    url: 'https://api.github.com/repos/MiningCattiva/x-spider/releases?per_page=1',
    headers: {
      'User-Agent': 'X-Spider',
    },
  });

  if (resp.status !== 200) {
    throw new Error('无法获取最新软件版本，请稍后再试。');
  }

  const body = JSON.parse(resp.body);

  if (!resp.body[0]) {
    throw new Error('无法获取最新软件版本，请稍后再试。');
  }

  return body[0];
}
