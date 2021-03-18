export class Modulo {
  constructor(public modulus: number) {}

  public add(x: number, y: number): number {
    const m = this.modulus;
    const t = x + y;
    if (t < m) {
      return t;
    } else {
      return t - m;
    }
  }

  public sub(x: number, y: number): number {
    const m = this.modulus;
    const t = x - y;
    if (t >= 0) {
      return t;
    } else {
      return t + m;
    }
  }

  public mul(x: number, y: number): number {
    const m = this.modulus;
    const t = x * y;
    if (t < m) {
      return t;
    } else if (t <= Number.MAX_SAFE_INTEGER) {
      return t % m;
    } else {
      return ((((x >> 16) * y) % m) * 65536 + (x & 65535) * y) % m;
    }
  }
}
