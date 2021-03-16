export function gcd(x: number, y: number): number {
  while (x !== 0) {
    [x, y] = [y % x, x];
  }
  return y;
}

export function gcdBigInt(x: bigint, y: bigint): bigint {
  while (x !== 0n) {
    [x, y] = [y % x, x];
  }
  return y;
}
