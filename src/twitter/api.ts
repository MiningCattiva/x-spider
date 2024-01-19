import { Response } from '../interfaces/Response';
import { TwitterAccountInfo } from '../interfaces/TwitterAccountInfo';
import { TwitterUser } from '../interfaces/TwitterUser';
import { request } from '../ipc/network';
import { useAppStateStore } from '../stores/app-state';
import * as R from 'ramda';
import { parseCookie } from '../utils/cookie';
import {
  TwitterMedia,
  TwitterMediaBase,
  TwitterMediaPhoto,
  TwitterMediaVideo,
} from '../interfaces/TwitterMedia';
import dayjs from 'dayjs';

async function getCookieString() {
  return useAppStateStore.getState().cookieString;
}

async function getCommonHeaders(
  withCredentials = true,
): Promise<Record<string, string>> {
  const cookies = await getCookieString();
  return {
    'User-Agent': navigator.userAgent,
    Referer: 'https://twitter.com',
    ...(withCredentials
      ? {
          Authorization:
            'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
          Cookie: cookies,
          'X-Csrf-Token': parseCookie(cookies)['ct0'],
        }
      : {}),
  };
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
    headers: R.mergeRight(await getCommonHeaders(false), {
      Cookie: cookieStringOverride,
    }),
  });
  ensureResponse(res);
  const html = res.body as string;
  const nameMatch = html.match(/"screen_name":"(.*?)"/);
  if (nameMatch === null) throw new Error('Cannot find name in response');

  const avatarMatch = html.match(/"profile_image_url_https":"(.*?)"/);
  if (avatarMatch === null) throw new Error('Cannot find avatar in response');

  return {
    screenName: nameMatch[1],
    avatar: avatarMatch[1],
  };
}

export async function getUser(screenName: string): Promise<TwitterUser> {
  const resp = await request({
    method: 'GET',
    responseType: 'json',
    url: 'https://twitter.com/i/api/graphql/NimuplG1OB7Fd2btCLdBOw/UserByScreenName',
    query: {
      features: JSON.stringify({
        hidden_profile_likes_enabled: true,
        hidden_profile_subscriptions_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        subscriptions_verification_info_is_identity_verified_enabled: true,
        subscriptions_verification_info_verified_since_enabled: true,
        highlights_tweets_tab_ui_enabled: true,
        responsive_web_twitter_article_notes_tab_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled:
          false,
        responsive_web_graphql_timeline_navigation_enabled: true,
      }),
      fieldToggles: JSON.stringify({ withAuxiliaryUserLabels: false }),
      variables: JSON.stringify({
        screen_name: screenName,
        withSafetyModeUserFields: true,
      }),
    },
    headers: await getCommonHeaders(),
  });
  ensureResponse(resp);

  const data = R.path(['data', 'user', 'result', 'legacy'])(resp.body) as any;

  if (!data) {
    throw new Error('User not found');
  }

  return {
    avatar: data?.profile_image_url_https,
    name: data?.name,
    screenName: data?.screen_name,
    id: R.path<string>(['data', 'user', 'result', 'rest_id'])(
      resp.body,
    ) as string,
  };
}

export async function getUserMedia(
  userId: string,
  cursor?: string,
): Promise<[TwitterMedia[], string | null]> {
  const resp = await request({
    method: 'GET',
    url: 'https://twitter.com/i/api/graphql/cEjpJXA15Ok78yO4TUQPeQ/UserMedia',
    responseType: 'json',
    query: {
      features: JSON.stringify({
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled:
          false,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        tweetypie_unmention_optimization_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
          true,
        rweb_video_timestamps_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_media_download_video_enabled: false,
        responsive_web_enhance_cards_enabled: false,
      }),
      variables: JSON.stringify({
        userId,
        count: 20,
        cursor,
        includePromotedContent: false,
        withClientEventToken: false,
        withBirdwatchNotes: false,
        withVoice: true,
        withV2Timeline: true,
      }),
    },
    headers: await getCommonHeaders(),
  });
  ensureResponse(resp);

  const toTwitterMediaBase: (v: any) => TwitterMediaBase = (v: any) => ({
    id: v.id_str,
    url: v.expanded_url,
    pic: v.media_url_https,
    createAt: dayjs(v.created_at).unix() * 1000,
  });

  const toPhoto: (v: any) => TwitterMediaPhoto = (v: any) => ({
    ...toTwitterMediaBase(v),
    type: 'photo',
  });

  const toVideo: (v: any) => TwitterMediaVideo = (v: any) => ({
    ...toTwitterMediaBase(v),
    type: 'video',
    videoInfo: {
      duration: v.video_info.duration_millis,
      variants: v.video_info.variants.map((item: any) => ({
        bitrate: item.bitrate,
        contentType: item.contentType,
        url: item.url,
      })),
    },
  });

  const mapModuleItems = R.pipe(
    R.map(
      R.pipe(
        R.path(['item', 'itemContent', 'tweet_results', 'result', 'legacy']),
        (legacy: any) =>
          R.pipe(
            R.path<any>(['entities', 'media']),
            R.map<any, TwitterMedia | null>(
              R.pipe(
                R.assoc('createAt', dayjs(legacy.created_at).unix() * 1000),
                R.cond([
                  [R.propEq('photo', 'type'), toPhoto],
                  // @ts-ignore
                  [R.propEq('video', 'type'), toVideo],
                  // @ts-ignore
                  [R.T, R.always(null)],
                ]),
              ),
            ),
            R.filter(R.isNotNil),
          )(legacy),
      ),
    ),
    R.flatten,
  );

  const pathToInstructions = R.path<any>([
    'data',
    'user',
    'result',
    'timeline_v2',
    'timeline',
    'instructions',
  ]);

  const extractFirst = R.pipe(
    pathToInstructions,
    R.find(R.pathEq('TimelineAddEntries', ['type'])),
    R.prop('entries'),
    R.find(R.pathEq('TimelineTimelineModule', ['content', 'entryType'])),
    R.ifElse(
      R.isNil,
      R.always([]),
      R.pipe(R.path<any>(['content', 'items']), mapModuleItems),
    ),
  );

  const extractMore = R.pipe(
    pathToInstructions,
    R.find(R.pathEq('TimelineAddToModule', ['type'])),
    R.ifElse(
      R.isNil,
      R.always([]),
      R.pipe(R.prop('moduleItems'), mapModuleItems),
    ),
  );

  const list: TwitterMedia[] = R.defaultTo(
    [],
    R.ifElse(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (_) => !!cursor,
      extractMore,
      extractFirst,
    )(resp.body) as TwitterMedia[],
  );

  if (list.length === 0) {
    return [[], null];
  }

  const nextCursor: null | string = R.defaultTo(
    null,
    R.pipe(
      R.path<any>([
        'data',
        'user',
        'result',
        'timeline_v2',
        'timeline',
        'instructions',
      ]),
      R.find(R.pathEq('TimelineAddEntries', ['type'])),
      R.prop('entries'),
      R.find(R.pathEq('Bottom', ['content', 'cursorType'])),
      R.path(['content', 'value']),
    )(resp.body) as null | string,
  );

  return [list, nextCursor];
}
