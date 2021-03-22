import fs = require("fs");

// input

const inputString = fs.readFileSync("/dev/stdin", "utf8");
const inputIterator = inputString.matchAll(/\S+/g);

export const ONE_BASED = 1 << 0;

function read(): string {
  return inputIterator.next().value[0];
}

export function scanString(): string {
  return read();
}

export function scanNumber(flags: number = 0): number {
  const value = parseInt(read(), 10);
  return flags & ONE_BASED ? value - 1 : value;
}

export function scanBigInt(flags: number = 0): bigint {
  const value = BigInt(read());
  return flags & ONE_BASED ? value - 1n : value;
}

export function scanStringArray(length: number): string[] {
  return Array.from({ length }, () => scanString());
}

export function scanNumberArray(length: number, flags: number = 0): number[] {
  return Array.from({ length }, () => scanNumber(flags));
}

export function scanBigIntArray(length: number, flags: number = 0): bigint[] {
  return Array.from({ length }, () => scanBigInt(flags));
}

export function scanInt32Array(length: number, flags: number = 0): Int32Array {
  return Int32Array.from({ length }, () => scanNumber(flags));
}

// output

const outputBuffer = Buffer.alloc(1 << 20);
let outputIndex = 0;

function flush(): void {
  process.stdout.write(outputBuffer.subarray(0, outputIndex));
  outputIndex = 0;
}

function write(data: string): void {
  const length = Buffer.byteLength(data);
  if (outputIndex + length > outputBuffer.length) {
    flush();
    if (length >= outputBuffer.length) {
      process.stdout.write(data);
      return;
    }
  }
  outputBuffer.write(data, outputIndex);
  outputIndex += length;
}

process.on("exit", () => {
  flush();
});

type Printable = string | number | bigint;

export function print(...args: Printable[]): void {
  for (const arg of args) {
    write(arg.toString());
  }
}

export function println(...args: Printable[]): void {
  print(...args);
  write("\n");
}
