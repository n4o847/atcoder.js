// @ts-ignore
import union_find_impl from "@assembly/union_find";

declare const union_find_impl: Uint8Array;

export class UnionFind {
  private static module: WebAssembly.Module;

  constructor(private instance: WebAssembly.Instance, length: number) {
    (instance.exports["constructor"] as Function)(length);
  }

  public static async new(length: number): Promise<UnionFind> {
    if (this.module) {
      const instance = await WebAssembly.instantiate(this.module);
      return new UnionFind(instance, length);
    } else {
      const { module, instance } = await WebAssembly.instantiate(
        union_find_impl
      );
      UnionFind.module = module;
      return new UnionFind(instance, length);
    }
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
