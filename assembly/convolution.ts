class RawArray<T> {
  [key: number]: T;

  @operator("[]")
  load(index: i32): T {
    return load<T>(changetype<usize>(this) + (index << alignof<T>()));
  }

  @operator("[]=")
  store(index: i32, value: T): void {
    store<T>(changetype<usize>(this) + (index << alignof<T>()), value);
  }
}

function raw<T>(ptr: usize): RawArray<T> {
  return changetype<RawArray<T>>(ptr);
}

function bsf(n: u32): i32 {
  return ctz(n);
}

function safe_mod(x: i32, m: i32): i32 {
  x %= m;
  if (x < 0) x += m;
  return x;
}

function add_mod(x: i32, y: i32, m: i32): i32 {
  return (x + y) % m;
  // x += y;
  // if (x >= m) x -= m;
  // return x;
}

function sub_mod(x: i32, y: i32, m: i32): i32 {
  return (x - y + m) % m;
  // x -= y;
  // if (x < 0) x += m;
  // return x;
}

function mul_mod(x: i32, y: i32, m: i32): i32 {
  return i32((i64(x) * i64(y)) % i64(m));
}

function butterfly(a_ptr: usize, h: i32, mod: i32, sum_e_ptr: usize): void {
  const a = raw<i32>(a_ptr);
  const sum_e = raw<i32>(sum_e_ptr);
  for (let ph = 1; ph <= h; ph++) {
    const w = 1 << (ph - 1);
    const p = 1 << (h - ph);
    let now = 1;
    for (let s = 0; s < w; s++) {
      const offset = s << (h - ph + 1);
      for (let i = 0; i < p; i++) {
        const l = a[i + offset];
        const r = mul_mod(a[i + offset + p], now, mod);
        a[i + offset] = add_mod(l, r, mod);
        a[i + offset + p] = sub_mod(l, r, mod);
      }
      now = mul_mod(now, sum_e[bsf(~u32(s))], mod);
    }
  }
}

function butterfly2(
  a_ptr: usize,
  b_ptr: usize,
  h: i32,
  mod: i32,
  sum_e_ptr: usize
): void {
  const a = raw<i32>(a_ptr);
  const b = raw<i32>(b_ptr);
  const sum_e = raw<i32>(sum_e_ptr);
  for (let ph = 1; ph <= h; ph++) {
    const w = 1 << (ph - 1);
    const p = 1 << (h - ph);
    let now = 1;
    for (let s = 0; s < w; s++) {
      const offset = s << (h - ph + 1);
      for (let i = 0; i < p; i++) {
        {
          const l = a[i + offset];
          const r = mul_mod(a[i + offset + p], now, mod);
          a[i + offset] = add_mod(l, r, mod);
          a[i + offset + p] = sub_mod(l, r, mod);
        }
        {
          const l = b[i + offset];
          const r = mul_mod(b[i + offset + p], now, mod);
          b[i + offset] = add_mod(l, r, mod);
          b[i + offset + p] = sub_mod(l, r, mod);
        }
      }
      now = mul_mod(now, sum_e[bsf(~u32(s))], mod);
    }
  }
}

function butterfly_inv(
  a_ptr: usize,
  h: i32,
  mod: i32,
  sum_ie_ptr: usize
): void {
  const a = raw<i32>(a_ptr);
  const sum_ie = raw<i32>(sum_ie_ptr);
  for (let ph = h; ph >= 1; ph--) {
    const w = 1 << (ph - 1);
    const p = 1 << (h - ph);
    let inow = 1;
    for (let s = 0; s < w; s++) {
      const offset = s << (h - ph + 1);
      for (let i = 0; i < p; i++) {
        const l = a[i + offset];
        const r = a[i + offset + p];
        a[i + offset] = add_mod(l, r, mod);
        a[i + offset + p] = mul_mod(sub_mod(l, r, mod), inow, mod);
      }
      inow = mul_mod(inow, sum_ie[bsf(~u32(s))], mod);
    }
  }
}

export function convolution(
  a_ptr: usize,
  b_ptr: usize,
  h: i32,
  mod: i32,
  sum_e_ptr: usize,
  sum_ie_ptr: usize,
  iz: i32
): void {
  const a = raw<i32>(a_ptr);
  const b = raw<i32>(b_ptr);
  const z = 1 << h;
  for (let i = 0; i < z; i++) {
    a[i] = safe_mod(a[i], mod);
  }
  for (let i = 0; i < z; i++) {
    b[i] = safe_mod(b[i], mod);
  }
  // butterfly(a_ptr, h, mod, sum_e_ptr);
  // butterfly(b_ptr, h, mod, sum_e_ptr);
  butterfly2(a_ptr, b_ptr, h, mod, sum_e_ptr);
  for (let i = 0; i < z; i++) {
    a[i] = mul_mod(a[i], b[i], mod);
  }
  butterfly_inv(a_ptr, h, mod, sum_ie_ptr);
  for (let i = 0; i < z; i++) {
    a[i] = mul_mod(a[i], iz, mod);
  }
}
