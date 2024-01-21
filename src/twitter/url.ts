export function buildPostUrl(screenName: string, postId: string) {
  return `https://twitter.com/${screenName}/status/${postId}`;
}

export function buildUserUrl(screenName: string) {
  return `https://twitter.com/${screenName}`;
}
