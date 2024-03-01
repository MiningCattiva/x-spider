export function isVersionGt(a: string, b: string) {
  const aa = a.split('.').map((v) => Number(v));
  const bb = b.split('.').map((v) => Number(v));

  return aa.some((v, i) => v > bb[i]);
}
