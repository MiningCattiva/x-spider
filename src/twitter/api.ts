import { Response } from '../interfaces/Response';
import { TwitterAccountInfo } from '../interfaces/TwitterAccountInfo';
import { request } from '../ipc/network';
import { useAppStateStore } from '../stores/app-state';

const COMMON_HEADERS = {
  'User-Agent': navigator.userAgent,
  Referer: 'https://twitter.com',
};

async function getCookieString() {
  return useAppStateStore.getState().cookieString;
}

function ensureResponse(response: Response) {
  if (response.status >= 400) {
    console.error(response);
    throw new Error(`Response error: status=${response.status}`);
  }
}

export async function getAccountInfo(
  cookieStringOverride?: string,
): Promise<TwitterAccountInfo> {
  const res = await request({
    method: 'GET',
    url: 'https://twitter.com',
    responseType: 'text',
    headers: {
      ...COMMON_HEADERS,
      Cookie: cookieStringOverride || (await getCookieString()),
    },
  });
  ensureResponse(res);
  const html = res.body as string;
  const nameMatch = html.match(/"screen_name":"(.*?)"/);
  if (nameMatch === null) throw new Error('Cannot find name in response');

  const avatarMatch = html.match(/"profile_image_url_https":"(.*?)"/);
  if (avatarMatch === null) throw new Error('Cannot find avatar in response');

  return {
    name: nameMatch[1],
    avatar: avatarMatch[1],
  };
}
