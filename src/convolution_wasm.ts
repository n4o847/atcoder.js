// @ts-ignore
import convolution_impl from "@assembly/convolution";

declare const convolution_impl: WebAssembly.Module;
import { Modulo } from "./modulo";

function bsf(x: number): number {
  return 31 - Math.clz32(x & -x);
}

function ceilPow2(x: number): number {
  return 32 - Math.clz32(x - 1);
}

export class Convolution extends Modulo {
  private instance: WebAssembly.Instance;
  private memory: WebAssembly.Memory;
  private sumE: Int32Array;
  private sumIe: Int32Array;

  constructor(mod: number = 998_244_353, primitiveRoot?: number) {
    super(mod);
    this.instance = new WebAssembly.Instance(convolution_impl);
    this.memory = this.instance.exports.memory as WebAssembly.Memory;
    this.memory.grow(1);

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

    this.sumE = new Int32Array(this.memory.buffer, 4 * 0, cnt2 - 1);
    this.sumIe = new Int32Array(this.memory.buffer, 4 * 30, cnt2 - 1);
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

    const aPtr = this.alloc(z * 2);
    const bPtr = aPtr + 4 * z;
    const a_ = new Int32Array(this.memory.buffer, aPtr, z);
    a_.set(a);
    const b_ = new Int32Array(this.memory.buffer, bPtr, z);
    b_.set(b);

    const iz = this.inv(z);

    (this.instance.exports["convolution"] as Function)(
      aPtr,
      bPtr,
      h,
      this.mod,
      4 * 0,
      4 * 30,
      iz
    );

    return new Int32Array(this.memory.buffer, aPtr, n + m - 1);
  }

  private alloc(size: number): number {
    const ptr = this.memory.grow((4 * size + 65535) >> 16) << 16;
    return ptr;
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
