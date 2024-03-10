import { request } from '../ipc/network';
import * as R from 'ramda';

export async function getLatestReleases(pre = false) {
  let url = 'https://api.github.com/repos/MiningCattiva/x-spider/releases';
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const resp = await request({
      method: 'GET',
      responseType: 'text',
      url,
      headers: {
        'User-Agent': 'X-Spider',
      },
    });

    if (resp.status !== 200) {
      throw new Error('无法获取最新软件版本，请稍后再试。');
    }

    const body = JSON.parse(resp.body);

    if (!body[0]) {
      throw new Error('无法获取最新软件版本，请稍后再试。');
    }

    if (pre) {
      return body[0] || null;
    }

    const latest = body.find((item: any) => !item.prerelease);

    if (latest) {
      return latest;
    }

    if (!resp.headers.link || resp.headers.link.length === 0) {
      return null;
    }

    const links = R.fromPairs(
      resp.headers.link[0].split(', ').map((item: string) => {
        const [link, rel] = item.split('; rel=');
        return [rel.replace(/"(.+)"/, '$1'), link.replace(/<(.+)>/, '$1')];
      }),
    );

    if (!links.next) return null;

    url = links.next;
  }
}
