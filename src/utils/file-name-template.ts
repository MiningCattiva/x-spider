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
      const regex = new RegExp(`%${elem[0]}%`, 'gi');
      const s = filenamify(String(elem[1].replacer(data)));
      return R.replace(regex, s)(acc);
    }, templateText),
  )(REPLACER_MAP);
}
