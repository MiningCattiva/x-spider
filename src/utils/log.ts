/* eslint-disable no-console */

import dayjs, { Dayjs } from 'dayjs';
import { path, fs } from '@tauri-apps/api';
import { useSettingsStore } from '../stores/settings';

const DEFAULT_CATEGORY = 'APP';

export class Logger implements ILogger {
  #now = dayjs();
  #logFileBuffers: string[] = [];
  #logFileTimeoutId: number | undefined;

  info(...messages: any[]) {
    this.#log('INFO', DEFAULT_CATEGORY, ...messages);
  }
  warn(...messages: any[]) {
    this.#log('WARN', DEFAULT_CATEGORY, ...messages);
  }
  error(...messages: any[]) {
    this.#log('ERROR', DEFAULT_CATEGORY, ...messages);
  }
  debug(...messages: any[]) {
    if (import.meta.env.DEV) {
      this.#log('DEBUG', DEFAULT_CATEGORY, ...messages);
    }
  }
  category(name: string): ICategoriedLogger {
    return {
      info: (...messages: any[]) => {
        this.#log('INFO', name, ...messages);
      },
      warn: (...messages: any[]) => {
        this.#log('WARN', name, ...messages);
      },
      error: (...messages: any[]) => {
        this.#log('ERROR', name, ...messages);
      },
      debug: (...messages: any[]) => {
        if (import.meta.env.DEV) {
          this.#log('DEBUG', name, ...messages);
        }
      },
    };
  }

  async #getLogFilePath() {
    const fileName = `${this.#now.format('YYYY-MM-DD HHmmss')}.log`;
    const logDir = await path.appLogDir();

    if (!(await fs.exists(logDir))) {
      await fs.createDir(logDir);
    }

    return await path.join(logDir, fileName);
  }

  #log(level: string, category: string, ...messages: any[]) {
    try {
      const time = dayjs();
      this.#logConsole(level, time, category, ...messages);

      if (useSettingsStore.getState().app.writeLogs) {
        this.#logFile(level, time, category, ...messages);
      }
    } catch (err) {
      console.error('Log error', err);
    }
  }

  #logFile(level: string, time: Dayjs, category: string, ...messages: any[]) {
    const fmtTime = time.toISOString();
    const msg = `${fmtTime} [${level}] <${category}> ${messages
      .map((m) => {
        if (m instanceof Error) {
          return JSON.stringify({
            type: 'Error',
            message: m.message,
            name: m.name,
          });
        }
        return JSON.stringify(m);
      })
      .join(' ')}`;
    this.#logFileBuffers.push(msg);
    clearTimeout(this.#logFileTimeoutId);

    this.#logFileTimeoutId = setTimeout(async () => {
      await fs.writeTextFile(
        await this.#getLogFilePath(),
        this.#logFileBuffers.join('\n') + '\n',
        {
          append: true,
        },
      );
      this.#logFileBuffers.length = 0;
    }, 500);
  }

  #logConsole(
    level: string,
    time: Dayjs,
    category: string,
    ...messages: any[]
  ) {
    let categoryColor = '#000000';

    if (category !== DEFAULT_CATEGORY) {
      const colorList = [
        '#f5222d',
        '#fa541c',
        '#fa8c16',
        '#faad14',
        '#d4b106',
        '#a0d911',
        '#52c41a',
        '#13c2c2',
        '#1677ff',
        '#2f54eb',
        '#722ed1',
        '#eb2f96',
      ];
      // Hash category name
      const hashedCategoryName = category
        .split('')
        .reduce((prev, curr) => prev + curr.charCodeAt(0), 0);
      categoryColor = colorList[hashedCategoryName % colorList.length];
    }

    const fmtTime = time.format('HH:mm:ss.SSS');

    const prefix = (level: string, color: string) => [
      `%c${fmtTime} %c[${level}]%c %c<${category}>%c`,
      'color: #aaa; font-weight: bold;',
      `color: white; font-weight: bold; background: ${color}`,
      'color: initial; background: initial; font-weight: initial;',
      `color: ${categoryColor}; font-weight: bold;`,
      'color: initial; background: initial; font-weight: initial;',
    ];

    switch (level) {
      case 'INFO':
        console.info(...prefix('INFO', '#52c41a'), ...messages);
        break;
      case 'WARN':
        console.warn(...prefix('WARN', '#d4b106'), ...messages);
        break;
      case 'ERROR':
        console.error(...prefix('ERROR', '#f5222d'), ...messages);
        break;
      case 'DEBUG':
        console.debug(...prefix('DEBUG', 'black'), ...messages);
        break;
    }
  }
}
