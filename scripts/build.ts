import path = require("path");
import fs = require("fs/promises");
import * as esbuild from "esbuild";
import * as asc from "assemblyscript/cli/asc";

const plugins: { [name: string]: esbuild.Plugin } = {
  assembly: {
    name: "assembly",
    setup(build) {
      build.onResolve({ filter: /^@assembly\// }, (args) => {
        return {
          path: args.path.replace(/^@assembly\//, ""),
          namespace: "assembly",
          pluginData: {
            name: args.path,
          },
        };
      });

      build.onLoad({ filter: /.*/, namespace: "assembly" }, async (args) => {
        await asc.ready;
        const file = path.join(__dirname, "../assembly", args.path) + ".ts";
        const script = await fs.readFile(file, "utf8");
        const { binary } = asc.compileString(script, {
          optimize: true,
        });
        if (binary === null) {
          throw new Error();
        }
        process.stderr.write(
          `${args.pluginData.name}: ${binary.length} bytes\n`
        );
        const base64 = Buffer.from(binary).toString("base64");
        return {
          contents: `
            export default __compile(${JSON.stringify(base64)});
          `,
        };
      });
    },
  },
};

async function main(...args: string[]) {
  const entry = args[0];
  if (typeof entry !== "string") {
    throw new TypeError("invalid arguments");
  }
  const content = await fs.readFile(entry, { encoding: "utf8" });
  const banner =
    content.replace(/^\n+|\n$/g, "").replace(/^|(?<=\n)/g, "// ") + "\n";
  await esbuild.build({
    entryPoints: [entry],
    bundle: true,
    minify: true,
    platform: "node",
    target: "node12.16.1",
    inject: ["./src/prelude.ts"],
    plugins: [plugins.assembly],
    banner: {
      js: banner,
    },
  });
}

main(...process.argv.slice(2));
