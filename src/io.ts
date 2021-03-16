import fs = require('fs');

// input

const inputString = fs.readFileSync(process.stdin.fd, 'utf8');
const inputIterator = inputString.matchAll(/\S+/g);

function read(): string {
  return inputIterator.next().value[0];
}

export function scanString(): string {
  return read();
}

export function scanNumber(): number {
  return parseInt(read(), 10);
}

export function scanBigInt(): bigint {
  return BigInt(read());
}

export function scanArrayString(length: number): string[] {
  return Array.from({ length }, () => scanString());
}

export function scanArrayNumber(length: number): number[] {
  return Array.from({ length }, () => scanNumber());
}

export function scanArrayBigInt(length: number): bigint[] {
  return Array.from({ length }, () => scanBigInt());
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
  }
  outputBuffer.write(data, outputIndex);
  outputIndex += length;
}

process.on('exit', () => {
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
  write('\n');
}
