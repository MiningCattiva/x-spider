export async function asyncMap<T = unknown, R = unknown>(
  fn: (value: T, index: number, array: T[]) => Promise<R>,
  data: T[],
): Promise<R[]> {
  return Promise.all(data.map(fn));
}
