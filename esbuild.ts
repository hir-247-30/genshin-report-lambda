import * as esbuild from 'esbuild';

const config: esbuild.BuildOptions = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  minify: false,
  sourcemap: false,
  platform: 'node',
  target: ['es2021'],
  format: 'esm',
  outfile: 'dist/index.mjs',
  banner: {
    js: "import{createRequire}from'module';const require=createRequire(import.meta.url);",
  },
};

esbuild.build(config);