export class Modulo {
  constructor(public mod: number) {}

  public safe(x: number): number {
    const m = this.mod;
    x %= m;
    if (x < 0) x += m;
    return x;
  }

  public add(x: number, y: number): number {
    const m = this.mod;
    const t = x + y;
    if (t < m) {
      return t;
    } else {
      return t - m;
    }
  }

  public sub(x: number, y: number): number {
    const m = this.mod;
    const t = x - y;
    if (t >= 0) {
      return t;
    } else {
      return t + m;
    }
  }

  public mul(x: number, y: number): number {
    const m = this.mod;
    const t = x * y;
    if (t < m) {
      return t;
    } else if (t <= Number.MAX_SAFE_INTEGER) {
      return t % m;
    } else {
      return ((((x >> 16) * y) % m) * 65536 + (x & 65535) * y) % m;
    }
  }

  public pow(x: number, n: number): number {
    let r = 1;
    while (n) {
      if (n & 1) r = this.mul(r, x);
      x = this.mul(x, x);
      n >>= 1;
    }
    return r;
  }

  public inv(x: number): number {
    return this.pow(x, this.mod - 2);
  }

  public div(x: number, y: number): number {
    return this.mul(x, this.inv(y));
  }
}
