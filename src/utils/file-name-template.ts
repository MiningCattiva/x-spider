import { REPLACER_MAP } from '../constants/file-name-template';
import { FileNameTemplateData } from '../interfaces/FileNameTemplateData';
import filenamify from 'filenamify';
import * as R from 'ramda';

export function resolveVariables(
  templateText: string,
  data: FileNameTemplateData,
  autoEscape = true,
): string {
  return R.pipe(
    R.toPairs,
    R.reduce((acc, elem: any) => {
      const regex = new RegExp(`%${elem[0]}%`, 'gi');
      const s = filenamify(String(elem[1].replacer(data)));
      return R.replace(regex, s)(acc);
    }, templateText),
    R.ifElse(
      R.always(autoEscape),
      (str: string) => filenamify(str),
      R.identity,
    ),
  )(REPLACER_MAP);
}
