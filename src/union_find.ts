import { range } from "./range";

export class UnionFind {
  private readonly data: Int32Array;

  constructor(public readonly length: number) {
    this.data = new Int32Array(length).fill(-1);
  }

  public find(x: number): number {
    if (this.data[x] < 0) return x;
    return (this.data[x] = this.find(this.data[x]));
  }

  public unite(x: number, y: number): void {
    x = this.find(x);
    y = this.find(y);
    if (x === y) return;
    if (-this.data[x] < -this.data[y]) [x, y] = [y, x];
    this.data[x] += this.data[y];
    this.data[y] = x;
  }

  public same(x: number, y: number): boolean {
    return this.find(x) === this.find(y);
  }

  public size(x: number): number {
    return -this.data[this.find(x)];
  }

  public groups(): Uint32Array[] {
    const offsetBuffer = new Uint32Array(this.length);
    let offset = 0;
    for (const i of range(this.length)) {
      if (this.data[i] < 0) {
        offsetBuffer[i] = offset;
        offset += -this.data[i];
      }
    }
    const resultBuffer = new Uint32Array(this.length);
    for (const i of range(this.length)) {
      resultBuffer[offsetBuffer[this.find(i)]++] = i;
    }
    offset = 0;
    const result: Uint32Array[] = [];
    for (const i of range(this.length)) {
      if (this.data[i] < 0) {
        result.push(resultBuffer.subarray(offset, offsetBuffer[i]));
        offset = offsetBuffer[i];
      }
    }
    return result;
  }
}
