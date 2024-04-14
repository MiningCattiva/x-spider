/**
 * From: https://github.com/lautis/unicode-substring/blob/master/index.js
 */

function charAt(string: string, index: number) {
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
    character = charAt(string, stringIndex);
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
