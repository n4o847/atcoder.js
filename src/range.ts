class Range {
  constructor(private end: number) {}

  *[Symbol.iterator](): Iterator<number> {
    for (let i = 0; i < this.end; i++) {
      yield i;
    }
  }
}

export function range(end: number): Range {
  return new Range(end);
}
