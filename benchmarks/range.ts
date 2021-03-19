import * as Benchmark from "benchmark";

const suite = new Benchmark.Suite();

function f(i: number): number {
  return i;
}

function* rangeByGenerator(n: number): Iterable<number> {
  for (let i = 0; i < n; i++) {
    yield i;
  }
}

function rangeByIterator1(n: number): Iterable<number> {
  return {
    [Symbol.iterator](): Iterator<number> {
      let i = 0;
      return {
        next(): IteratorResult<number> {
          if (i < n) {
            return { done: false, value: i++ };
          } else {
            return { done: true, value: undefined };
          }
        },
      };
    },
  };
}

class Range2 implements Iterable<number> {
  constructor(private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    let i = 0;
    const n = this.end;
    return {
      next(): IteratorResult<number> {
        if (i < n) {
          return { done: false, value: i++ };
        } else {
          return { done: true, value: undefined };
        }
      },
    };
  }
}

function rangeByIterator2(n: number): Iterable<number> {
  return new Range2(n);
}

class RangeIterator implements Iterator<number> {
  private value = 0;

  constructor(private end: number) {}

  next(): IteratorResult<number> {
    if (this.value < this.end) {
      return { done: false, value: this.value++ };
    } else {
      return { done: true, value: undefined };
    }
  }
}

function rangeByIterator3(n: number): Iterable<number> {
  return {
    [Symbol.iterator](): Iterator<number> {
      return new RangeIterator(n);
    },
  };
}

class Range4 implements Iterable<number> {
  constructor(private end: number) {}

  [Symbol.iterator](): Iterator<number> {
    return new RangeIterator(this.end);
  }
}

function rangeByIterator4(n: number): Iterable<number> {
  return new Range4(n);
}

suite.add("generator, 1000000", () => {
  for (const i of rangeByGenerator(1000000)) {
    f(i);
  }
});

suite.add("generator, 1000 * 1000", () => {
  for (const i of rangeByGenerator(1000)) {
    for (const j of rangeByGenerator(1000)) {
      f(i + j);
    }
  }
});

suite.add("iterator1, 1000000", () => {
  for (const i of rangeByIterator1(1000000)) {
    f(i);
  }
});

suite.add("iterator1, 1000 * 1000", () => {
  for (const i of rangeByIterator1(1000)) {
    for (const j of rangeByIterator1(1000)) {
      f(i + j);
    }
  }
});

suite.add("iterator2, 1000000", () => {
  for (const i of rangeByIterator2(1000000)) {
    f(i);
  }
});

suite.add("iterator2, 1000 * 1000", () => {
  for (const i of rangeByIterator2(1000)) {
    for (const j of rangeByIterator2(1000)) {
      f(i + j);
    }
  }
});

suite.add("iterator3, 1000000", () => {
  for (const i of rangeByIterator3(1000000)) {
    f(i);
  }
});

suite.add("iterator3, 1000 * 1000", () => {
  for (const i of rangeByIterator3(1000)) {
    for (const j of rangeByIterator3(1000)) {
      f(i + j);
    }
  }
});

suite.add("iterator4, 1000000", () => {
  for (const i of rangeByIterator4(1000000)) {
    f(i);
  }
});

suite.add("iterator4, 1000 * 1000", () => {
  for (const i of rangeByIterator4(1000)) {
    for (const j of rangeByIterator4(1000)) {
      f(i + j);
    }
  }
});

suite.on("cycle", (event: Benchmark.Event) => {
  console.log(String(event.target));
});

suite.on("complete", () => {
  console.log("done");
});

suite.run();
