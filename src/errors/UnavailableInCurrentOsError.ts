export class UnavailableInCurrentOsError extends Error {
  constructor(message?: string) {
    super(message || '该操作不支持当前操作系统。');
  }
}
