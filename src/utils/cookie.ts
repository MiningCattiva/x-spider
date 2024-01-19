import * as R from 'ramda';

export function parseCookie(cookieString: string): Record<string, string> {
  return R.pipe(
    R.split(';'),
    R.map(R.pipe(R.trim, R.split('='))),
    // @ts-ignore
    R.fromPairs,
  )(cookieString) as Record<string, string>;
}

export function stringifyCookie(cookie: Record<string, string>): string {
  return R.pipe(R.toPairs, R.map(R.join('=')), R.join(';'))(cookie);
}
