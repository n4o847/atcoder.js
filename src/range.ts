class Range implements Iterable<number> {
  constructor(private end: number) {}

  public [Symbol.iterator](): Iterator<number> {
    return new RangeIterator(this.end);
  }
}

class RangeIterator implements Iterator<number> {
  private value: number = 0;

  constructor(private end: number) {}

  public next(): IteratorResult<number> {
    if (this.value < this.end) {
      return { done: false, value: this.value++ };
    } else {
      return { done: true, value: undefined };
    }
  }
}

export function range(end: number): Range {
  return new Range(end);
}
