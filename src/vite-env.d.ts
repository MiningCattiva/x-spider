/// <reference types="vite/client" />

declare const PACKAGE_JSON_VERSION: string;
declare const PACKAGE_JSON_LICENSE: string;
interface Logger {
  info: (...messages: any[]) => void;
  warn: (...messages: any[]) => void;
  error: (...messages: any[]) => void;
  debug: (...messages: any[]) => void;
}

declare interface Window {
  log: Logger;
}

declare const log: Logger;
