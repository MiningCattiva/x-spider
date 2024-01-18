export interface CrossPlatformInvoker<T extends (...args: any[]) => any> {
  windows?: T;
  macos?: T;
  linux?: T;
}
