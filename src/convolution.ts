import { Modulo } from "./modulo";

function bsf(x: number): number {
  return 31 - Math.clz32(x & -x);
}

function ceilPow2(x: number): number {
  return 31 - Math.clz32(x - 1);
}

export class Convolution extends Modulo {
  private sumE: Int32Array;
  private sumIe: Int32Array;

  constructor(mod: number = 998_244_353, primitiveRoot?: number) {
    super(mod);
    const cnt2 = bsf(mod - 1);
    let e = this.pow(
      primitiveRoot ?? this.calcPrimitiveRoot(mod),
      (mod - 1) >> cnt2
    );
    let ie = this.inv(e);

    const es = new Int32Array(cnt2 - 1);
    const ies = new Int32Array(cnt2 - 1);
    for (let i = cnt2; i >= 2; i--) {
      es[i - 2] = e;
      ies[i - 2] = ie;
      e = this.mul(e, e);
      ie = this.mul(ie, ie);
    }
    let now = 1;
    let inow = 1;

    this.sumE = new Int32Array(cnt2 - 1);
    this.sumIe = new Int32Array(cnt2 - 1);
    for (let i = 0; i <= cnt2 - 2; i++) {
      this.sumE[i] = this.mul(es[i], now);
      now = this.mul(now, ies[i]);
      this.sumIe[i] = this.mul(ies[i], inow);
      inow = this.mul(inow, es[i]);
    }
  }

  public convolution(a: Int32Array, b: Int32Array): Int32Array {
    const n = a.length;
    const m = b.length;
    if (n === 0 || m === 0) return new Int32Array(0);

    if (Math.min(n, m) <= 60) {
      const c = new Int32Array(n + m - 1);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
          c[i + j] = this.add(c[i + j], this.mul(a[i], b[j]));
        }
      }
      return c;
    }

    const h = ceilPow2(n + m - 1);
    const z = 1 << h;

    const a_ = new Int32Array(z);
    for (let i = 0; i < n; i++) {
      a_[i] = this.safe(a[i]);
    }
    a = a_;
    const b_ = new Int32Array(z);
    for (let i = 0; i < m; i++) {
      b_[i] = this.safe(b[i]);
    }
    b = b_;

    this.butterfly(a, h);
    this.butterfly(b, h);

    for (let i = 0; i < z; i++) {
      a[i] = this.mul(a[i], b[i]);
    }

    this.butterflyInv(a, h);

    const iz = this.inv(z);
    for (let i = 0; i < n + m - 1; i++) {
      a[i] = this.mul(a[i], iz);
    }

    return a.subarray(0, n + m - 1);
  }

  private butterfly(a: Int32Array, h: number): void {
    for (let ph = 1; ph <= h; ph++) {
      const w = 1 << (ph - 1);
      const p = 1 << (h - ph);
      let now = 1;
      for (let s = 0; s < w; s++) {
        const offset = s << (h - ph + 1);
        for (let i = 0; i < p; i++) {
          const l = a[i + offset];
          const r = this.mul(a[i + offset + p], now);
          a[i + offset] = this.add(l, r);
          a[i + offset + p] = this.sub(l, r);
        }
        now = this.mul(now, this.sumE[bsf(~s)]);
      }
    }
  }

  private butterflyInv(a: Int32Array, h: number): void {
    for (let ph = h; ph >= 1; ph--) {
      const w = 1 << (ph - 1);
      const p = 1 << (h - ph);
      let inow = 1;
      for (let s = 0; s < w; s++) {
        const offset = s << (h - ph + 1);
        for (let i = 0; i < p; i++) {
          const l = a[i + offset];
          const r = a[i + offset + p];
          a[i + offset] = this.add(l, r);
          a[i + offset + p] = this.mul(this.sub(l, r), inow);
        }
        inow = this.mul(inow, this.sumIe[bsf(~s)]);
      }
    }
  }

  private calcPrimitiveRoot(mod: number): number {
    if (mod === 2) return 1;
    if (mod === 998_244_353) return 3;

    const divs = [2];
    let x = (mod - 1) >> 1;
    while ((x & 1) === 0) x >>= 1;
    for (let i = 3; i * i <= x; i += 2) {
      if (x % i === 0) {
        divs.push(i);
        while (x % i === 0) x /= i;
      }
    }
    if (x > 1) divs.push(x);

    for (let g = 2; ; g++) {
      let ok = true;
      for (const d of divs) {
        if (this.pow(g, (mod - 1) / d) === 1) {
          ok = false;
          break;
        }
      }
      if (ok) return g;
    }
  }
}
