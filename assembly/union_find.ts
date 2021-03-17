function loadData(i: i32): i32 {
  return load<i32>(i << 2);
}

function storeData(i: i32, value: i32): void {
  store<i32>(i << 2, value);
}

export function constructor(n: i32): void {
  memory.grow(((n << 2) + 65535) >> 16);
  for (let i = 0; i < n; i++) {
    storeData(i, -1);
  }
}

export function find(x: i32): i32 {
  if (loadData(x) < 0) {
    return x;
  } else {
    const p = find(loadData(x));
    storeData(x, p);
    return p;
  }
}

export function unite(x: i32, y: i32): void {
  x = find(x);
  y = find(y);
  if (x === y) return;
  if (-loadData(x) < -loadData(y)) {
    const t = x;
    x = y;
    y = t;
  }
  storeData(x, loadData(x) + loadData(y));
  storeData(y, x);
}

export function same(x: i32, y: i32): bool {
  return find(x) === find(y);
}
