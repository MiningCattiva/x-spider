/// <reference types="vite/client" />

declare const PACKAGE_JSON_VERSION: string;
declare const PACKAGE_JSON_LICENSE: string;
interface ILogger {
  info: (...messages: any[]) => void;
  warn: (...messages: any[]) => void;
  error: (...messages: any[]) => void;
  debug: (...messages: any[]) => void;
  category: (name: string) => ICategoriedLogger;
}

declare type ICategoriedLogger = Omit<ILogger, 'category'>;

declare interface Window {
  log: ILogger;
}

declare const log: ILogger;
