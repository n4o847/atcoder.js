export const __compile = (base64: string): WebAssembly.Module => {
  return new WebAssembly.Module(Buffer.from(base64, "base64"));
};
