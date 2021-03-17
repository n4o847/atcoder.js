// @ts-ignore
import union_find_impl from "@assembly/union_find";

declare const union_find_impl: Uint8Array;

export class UnionFind {
  private static module: WebAssembly.Module;
  private instance: WebAssembly.Instance;

  constructor(length: number) {
    UnionFind.module ??= new WebAssembly.Module(union_find_impl);
    this.instance = new WebAssembly.Instance(UnionFind.module);
    (this.instance.exports["constructor"] as Function)(length);
  }

  public find(x: number): number {
    return (this.instance.exports["find"] as Function)(x);
  }

  public unite(x: number, y: number): void {
    (this.instance.exports["unite"] as Function)(x, y);
  }

  public same(x: number, y: number): boolean {
    return Boolean((this.instance.exports["same"] as Function)(x, y));
  }
}
