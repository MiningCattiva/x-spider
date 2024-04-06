import { REPLACER_MAP } from '../constants/file-name-template';
import { FileNameTemplateData } from '../interfaces/FileNameTemplateData';
import filenamify from 'filenamify';
import * as R from 'ramda';

export function resolveVariables(
  templateText: string,
  data: FileNameTemplateData,
): string {
  return R.pipe(
    R.toPairs,
    R.reduce((acc, elem: any) => {
      return acc.replace(
        new RegExp(`%${elem[0]}((?:,[a-z]=.+?)+)?%`, 'gi'),
        (_str, paramsString: string) => {
          const params = R.ifElse(
            R.isNotNil,
            R.pipe(
              // @ts-ignore
              R.slice(1, Infinity),
              R.split(','),
              R.map(R.split('=')),
              R.fromPairs,
            ),
            R.always({}),
            // @ts-ignore
          )(paramsString);
          const s = filenamify(String(elem[1].replacer(data, params)));
          return s;
        },
      );
    }, templateText),
  )(REPLACER_MAP);
}
