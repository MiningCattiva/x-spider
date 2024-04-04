import dayjs from 'dayjs';
import * as R from 'ramda';
import { Response } from '../interfaces/Response';
import { TwitterAccountInfo } from '../interfaces/TwitterAccountInfo';
import {
  TwitterMedia,
  TwitterMediaBase,
  TwitterMediaGif,
  TwitterMediaPhoto,
  TwitterMediaVideo,
} from '../interfaces/TwitterMedia';
import { TwitterPost } from '../interfaces/TwitterPost';
import { TwitterUser } from '../interfaces/TwitterUser';
import { request } from '../ipc/network';
import { useAppStateStore } from '../stores/app-state';
import { parseCookie } from '../utils/cookie';
import MediaType from '../enums/MediaType';

function getCommonHeaders(withCredentials = true): Record<string, string> {
  const cookies = useAppStateStore.getState().cookieString;
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
    headers: R.mergeRight(getCommonHeaders(false), {
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
    headers: getCommonHeaders(),
  });
  ensureResponse(resp);

  const data = R.path(['data', 'user', 'result', 'legacy'])(resp.body) as any;

  if (!data) {
    throw new Error('找不到该用户');
  }

  return {
    avatar: data?.profile_image_url_https,
    name: data?.name,
    screenName: data?.screen_name,
    id: R.path<string>(['data', 'user', 'result', 'rest_id'])(
      resp.body,
    ) as string,
    mediaCount: data?.media_count,
    registerTime: dayjs(data.created_at),
  };
}

const extractTwitterPosts = (
  pathToInstructions: (data: any) => any,
  data: any,
): TwitterPost[] | undefined => {
  const mapTwitterPosts = (posts: any[]) => {
    const mapTwitterMedias = (medias: any[]) => {
      const toTwitterMediaBase: (v: any) => TwitterMediaBase = (v: any) => {
        return {
          id: v?.id_str,
          url: v?.media_url_https,
          width: v?.original_info?.width,
          height: v?.original_info?.height,
        };
      };

      const toPhoto: (v: any) => TwitterMediaPhoto = (v: any) => ({
        ...toTwitterMediaBase(v),
        type: MediaType.Photo,
      });

      const toVideo: (v: any) => TwitterMediaVideo = (v: any) => ({
        ...toTwitterMediaBase(v),
        type: MediaType.Video,
        videoInfo: {
          duration: v?.video_info?.duration_millis,
          variants: v?.video_info?.variants?.map?.((item: any) => ({
            bitrate: item?.bitrate,
            contentType: item?.contentType,
            url: item?.url,
          })),
          aspectRatio: v?.aspect_ratio,
        },
      });

      const toGif: (v: any) => TwitterMediaGif = (v: any) => ({
        ...toTwitterMediaBase(v),
        type: MediaType.Gif,
        videoInfo: {
          url: v?.video_info?.variants?.[0]?.url,
          aspectRatio: v?.video_info?.aspect_ratio,
        },
      });

      return R.pipe<any[], (TwitterMedia | null)[], TwitterMedia[]>(
        R.map<any, TwitterMedia | null>(
          R.cond<any, TwitterMedia | null>([
            [R.propEq('photo', 'type'), toPhoto],
            [R.propEq('video', 'type'), toVideo],
            [R.propEq('animated_gif', 'type'), toGif],
            [R.T, R.always(null)],
          ]),
        ),
        R.filter<TwitterMedia | null, TwitterMedia>(R.isNotNil),
      )(medias);
    };
    return R.map<any, TwitterPost>((item) => {
      return {
        id: item?.rest_id,
        views: R.isNotNil(item?.views?.count)
          ? Number(item.views.count)
          : undefined,
        createdAt: dayjs(item.legacy.created_at),
        bookmarkCount: item?.legacy?.bookmark_count,
        bookmarked: item?.legacy?.bookmarked,
        favoriteCount: item?.legacy?.favorite_count,
        favorited: item?.legacy?.favorited,
        fullText: item?.legacy?.full_text,
        lang: item?.legacy?.lang,
        possiblySensitive: item?.legacy?.possibly_sensitive,
        replyCount: item?.legacy?.reply_count,
        retweeted: item?.legacy?.retweeted,
        retweetCount: item?.legacy?.retweet_count,
        medias: item?.legacy?.entities?.media
          ? mapTwitterMedias(item.legacy.entities.media)
          : undefined,
        tags: R.pipe<any, any[], string[]>(
          R.path<any>(['legacy', 'entities', 'hashtags']),
          R.ifElse(R.isNotNil, R.map(R.prop('text')), R.always([])),
        )(item),
        user: {
          id: item?.core?.user_results?.result?.rest_id,
          avatar:
            item?.core?.user_results?.result?.legacy?.profile_image_url_https,
          mediaCount: item?.core?.user_results?.result?.legacy?.media_count,
          name: item?.core?.user_results?.result?.legacy?.name,
          screenName: item?.core?.user_results?.result?.legacy?.screen_name,
          registerTime: item?.core?.user_results?.result?.legacy?.created_at,
        },
      };
    })(posts);
  };

  const pathToTwitterPostItems = (instructions: any): any => {
    const pathToModuleItemsFirst = R.pipe<[any], any, any, any, any>(
      R.find(R.pathEq('TimelineAddEntries', ['type'])),
      R.prop('entries'),
      R.find(R.pathEq('TimelineTimelineModule', ['content', 'entryType'])),
      R.both(R.isNotNil, R.path<any>(['content', 'items'])),
    );

    const pathToModuleItemsMore = R.pipe<[any], any, any>(
      R.find(R.pathEq('TimelineAddToModule', ['type'])),
      R.both(R.isNotNil, R.prop('moduleItems')),
    );

    return R.pipe<any, any, any[]>(
      R.either(pathToModuleItemsFirst, pathToModuleItemsMore),
      R.ifElse(
        (param) => !param,
        R.always([]),
        R.map(
          R.pipe(
            R.path<any>(['item', 'itemContent', 'tweet_results', 'result']),
            R.ifElse<any, any, any>(
              R.propEq('TweetWithVisibilityResults', '__typename'),
              R.prop('tweet'),
              R.identity,
            ),
          ),
        ),
      ),
    )(instructions);
  };
  return R.pipe(
    pathToInstructions,
    pathToTwitterPostItems,
    mapTwitterPosts,
  )(data);
};

const extractNextCursor = (
  pathToInstructions: (data: any) => any,
  data: any,
): string | null => {
  return R.pipe<any, any, any, any, any, string | undefined, string | null>(
    pathToInstructions,
    R.find(R.pathEq('TimelineAddEntries', ['type'])),
    R.prop('entries'),
    R.find(R.pathEq('Bottom', ['content', 'cursorType'])),
    R.path(['content', 'value']),
    R.defaultTo(null),
  )(data);
};

export async function getUserMedias(
  userId: string,
  cursor?: string,
  count = 20,
): Promise<{
  twitterPosts: TwitterPost[];
  cursor: string | null;
}> {
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
        count,
        cursor,
        includePromotedContent: false,
        withClientEventToken: false,
        withBirdwatchNotes: false,
        withVoice: true,
        withV2Timeline: true,
      }),
    },
    headers: getCommonHeaders(),
  });
  ensureResponse(resp);

  const pathToInstructions = R.path<any>([
    'data',
    'user',
    'result',
    'timeline_v2',
    'timeline',
    'instructions',
  ]);

  const twitterPosts = extractTwitterPosts(pathToInstructions, resp.body);

  if (!twitterPosts || twitterPosts.length === 0) {
    return {
      cursor: null,
      twitterPosts: [],
    };
  }

  const nextCursor = extractNextCursor(pathToInstructions, resp.body);

  return {
    twitterPosts,
    cursor: nextCursor,
  };
}
