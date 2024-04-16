/**
 * From: https://github.com/lautis/unicode-substring/blob/master/index.js
 */

// eslint-disable-next-line no-control-regex
const filenameReservedRegex = () => /[<>:"/\\|?*\u0000-\u001F]/;
const windowsReservedNameRegex = () => /^(con|prn|aux|nul|com\d|lpt\d)$/i;

export function unicodeCharAt(string: string, index: number) {
  const first = string.charCodeAt(index);
  let second: number;
  if (first >= 0xd800 && first <= 0xdbff && string.length > index + 1) {
    second = string.charCodeAt(index + 1);
    if (second >= 0xdc00 && second <= 0xdfff) {
      return string.substring(index, index + 2);
    }
  }
  return string[index];
}

function slice(string: string, start: number, end: number) {
  let accumulator = '';
  let character;
  let stringIndex = 0;
  let unicodeIndex = 0;
  const length = string.length;

  while (stringIndex < length) {
    character = unicodeCharAt(string, stringIndex);
    if (unicodeIndex >= start && unicodeIndex < end) {
      accumulator += character;
    }
    stringIndex += character.length;
    unicodeIndex += 1;
  }
  return accumulator;
}

export function unicodeSubstring(string: string, start: number, end: number) {
  if (end === start) {
    return '';
  } else if (end > start) {
    return slice(string, start, end);
  } else {
    return slice(string, end, start);
  }
}

export function unicodeSplit(str: string) {
  const arr: string[] = [];
  let index = 0;

  while (index < str.length) {
    const char = unicodeCharAt(str, index);
    arr.push(char);
    index += char.length;
  }
  return arr;
}

export function unicodeFilenamify(str: string) {
  if (windowsReservedNameRegex().test(str)) {
    return str + '!';
  }
  return unicodeSplit(str)
    .map((char) => {
      if (filenameReservedRegex().test(char)) {
        return '!';
      }
      return char;
    })
    .join('');
}
