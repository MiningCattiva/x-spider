/* eslint-disable no-console */

import dayjs, { Dayjs } from 'dayjs';
import { path, fs } from '@tauri-apps/api';
import { useSettingsStore } from '../stores/settings';

function logConsole(level: string, time: Dayjs, ...messages: any[]) {
  const fmtTime = time.format('HH:mm:ss.SSS');
  switch (level) {
    case 'INFO':
      console.info(
        `%c${fmtTime} %c[INFO]%c`,
        'color: #aaa; font-weight: bold;',
        'color: white; font-weight: bold; background: #52c41a',
        'color: initial; background: initial; font-weight: initial;',
        ...messages,
      );
      break;
    case 'WARN':
      console.warn(
        `%c${fmtTime} %c[WARN]`,
        'color: #aaa; font-weight: bold;',
        'color: white; font-weight: bold; background: #d4b106',
        ...messages,
      );
      break;
    case 'ERROR':
      console.error(
        `%c${fmtTime} %c[ERROR]`,
        'color: #aaa; font-weight: bold;',
        'color: white; font-weight: bold; background: #f5222d',
        ...messages,
      );
      break;
    case 'DEBUG':
      console.debug(
        `%c${fmtTime} %c[DEBUG]`,
        'color: #aaa; font-weight: bold;',
        'color: white; font-weight: bold; background: black',
        ...messages,
      );
      break;
  }
}

const logFilePath = (async () => {
  const fileName = `${dayjs().format('YYYY-MM-DD HHmmss')}.log`;
  const logDir = await path.appLogDir();

  if (!(await fs.exists(logDir))) {
    await fs.createDir(logDir);
  }

  return await path.join(logDir, fileName);
})();

const writeLine = (() => {
  const writeBuffers: string[] = [];
  let timeoutId: number | undefined;

  return async (msg: string) => {
    writeBuffers.push(msg);

    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      await fs.writeTextFile(await logFilePath, writeBuffers.join('\n'), {
        append: true,
      });
      writeBuffers.length = 0;
    }, 500);
  };
})();

async function logFile(level: string, time: Dayjs, ...messages: any[]) {
  const fmtTime = time.toISOString();
  const msg = `${fmtTime} [${level}] ${messages.map((m) => JSON.stringify(m)).join(' ')}`;
  await writeLine(msg);
}

async function _log(level: string, ...messages: any[]) {
  try {
    const time = dayjs();
    logConsole(level, time, ...messages);

    if (useSettingsStore.getState().app.writeLogs) {
      await logFile(level, time, ...messages);
    }
  } catch (err) {
    console.error('Log error', err);
  }
}

const logger: Logger = {
  info(...messages) {
    _log('INFO', ...messages);
  },
  warn(...messages) {
    _log('WARN', ...messages);
  },
  error(...messages) {
    _log('ERROR', ...messages);
  },
  debug(...messages) {
    if (import.meta.env.DEV) {
      _log('DEBUG', ...messages);
    }
  },
};

window.log = logger;

window.addEventListener('error', (ev) => {
  log.error('WindowError', {
    error: ev.error,
    message: ev.message,
    filename: ev.filename,
  });
});

window.addEventListener('unhandledrejection', (ev) => {
  log.error('unhandledrejection', {
    promise: ev.promise,
    reason: ev.reason,
  });
});
