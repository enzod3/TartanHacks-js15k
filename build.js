#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { minify: minifyJS } = require('terser');
const { minify: minifyHTML } = require('html-minifier-terser');

const SRC = path.join(__dirname, 'src');
const DIST = path.join(__dirname, 'dist');

// ── Files to skip minification (copied as-is to dist) ───
const IGNORE = [];
const jsFiles = ['w.min.full.js','index.js'];

// ── Helpers ──────────────────────────────────────────────

function gzipSize(buf) {
  return zlib.gzipSync(buf, { level: 9 }).length;
}

function brotliSize(buf) {
  return zlib.brotliCompressSync(buf, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
  }).length;
}

function fmtBytes(b) {
  if (b < 1024) return b + ' B';
  return (b / 1024).toFixed(2) + ' KB';
}

function getAllFiles(dir, list = []) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) getAllFiles(full, list);
    else list.push(full);
  }
  return list;
}

// ── Terser options (maximum compression) ─────────────────

const TERSER_OPTS = {
  ecma: 2020,
  module: false,
  toplevel: false,
  compress: {
    passes: 3,
    unsafe: true,
    unsafe_math: true,
    unsafe_arrows: true,
    unsafe_comps: true,
    unsafe_methods: true,
    unsafe_proto: true,
    unsafe_regexp: true,
    unsafe_undefined: true,
    booleans_as_integers: true,
    drop_console: true,
    drop_debugger: true,
    dead_code: true,
    collapse_vars: true,
    reduce_vars: true,
    hoist_funs: true,
    hoist_vars: false,
    join_vars: true,
    sequences: true,
    conditionals: true,
    if_return: true,
    pure_getters: true,
  },
  mangle: {
    toplevel: false,
    properties: false, // don't mangle properties — W.gl, W.models etc need to stay
  },
  output: {
    comments: false,
    beautify: false,
    semicolons: true,
  },
};

// ── Build ────────────────────────────────────────────────

async function build() {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║              BUILD PIPELINE                         ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log('');

  fs.rmSync(DIST, { recursive: true, force: true });
  const BUNDLED = path.join(DIST, 'bundled');
  const SPLIT = path.join(DIST, 'split');
  fs.mkdirSync(BUNDLED, { recursive: true });
  fs.mkdirSync(SPLIT, { recursive: true });

  // ── 1. Report src sizes ────────────────────────────────
  console.log('── SOURCE (src/) ──────────────────────────────────────');
  const srcFiles = getAllFiles(SRC);
  let totalSrcRaw = 0;

  for (const f of srcFiles) {
    const buf = fs.readFileSync(f);
    const rel = path.relative(SRC, f);
    totalSrcRaw += buf.length;
    console.log(`  ${rel.padEnd(25)} ${fmtBytes(buf.length).padStart(10)} raw  │ ${fmtBytes(gzipSize(buf)).padStart(10)} gzip │ ${fmtBytes(brotliSize(buf)).padStart(10)} br`);
  }

  const srcConcatBuf = Buffer.concat(srcFiles.map(f => fs.readFileSync(f)));
  console.log('  ─────────────────────────────────────────────────────');
  console.log(`  ${'TOTAL'.padEnd(25)} ${fmtBytes(totalSrcRaw).padStart(10)} raw  │ ${fmtBytes(gzipSize(srcConcatBuf)).padStart(10)} gzip │ ${fmtBytes(brotliSize(srcConcatBuf)).padStart(10)} br`);
  console.log('');

  // ── 2. Minify JS files ─────────────────────────────────
  console.log('── MINIFYING JS ───────────────────────────────────────');

  const minifiedJS = {};

  for (const name of jsFiles) {
    const src = fs.readFileSync(path.join(SRC, name), 'utf8');
    const result = await minifyJS(src, TERSER_OPTS);
    if (result.error) {
      console.error(`  ✗ ${name}:`, result.error);
      process.exit(1);
    }
    minifiedJS[name] = result.code;
    console.log(`  ✓ ${name}: ${fmtBytes(Buffer.byteLength(src))} → ${fmtBytes(Buffer.byteLength(result.code))} (${((1 - Buffer.byteLength(result.code) / Buffer.byteLength(src)) * 100).toFixed(1)}% smaller)`);
  }
  console.log('');

  // ── 3a. SPLIT: minified HTML referencing external JS ───
  console.log('── dist/split/ (separate files) ───────────────────────');

  for (const name of jsFiles) {
    fs.writeFileSync(path.join(SPLIT, name), minifiedJS[name]);
  }

  let splitHtml = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  splitHtml = await minifyHTML(splitHtml, {
    collapseWhitespace: true, removeComments: true,
    removeAttributeQuotes: true, minifyCSS: true, minifyJS: false,
  });
  fs.writeFileSync(path.join(SPLIT, 'index.html'), splitHtml);

  for (const f of getAllFiles(SPLIT)) {
    const buf = fs.readFileSync(f);
    const rel = path.relative(SPLIT, f);
    console.log(`  ${rel.padEnd(25)} ${fmtBytes(buf.length).padStart(10)} raw  │ ${fmtBytes(gzipSize(buf)).padStart(10)} gzip │ ${fmtBytes(brotliSize(buf)).padStart(10)} br`);
  }
  console.log('');

  // ── 3b. BUNDLED: single HTML with inlined JS ──────────
  console.log('── dist/bundled/ (single file) ────────────────────────');

  let bundledHtml = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  for (const name of jsFiles) {
    bundledHtml = bundledHtml.replace(
      new RegExp(`<script src="${name}"></script>`),
      `<script>${minifiedJS[name]}</script>`
    );
  }
  bundledHtml = await minifyHTML(bundledHtml, {
    collapseWhitespace: true, removeComments: true,
    removeAttributeQuotes: true, minifyCSS: true, minifyJS: false,
  });
  fs.writeFileSync(path.join(BUNDLED, 'index.html'), bundledHtml);

  const bundleBuf = Buffer.from(bundledHtml);
  console.log(`  index.html               ${fmtBytes(bundleBuf.length).padStart(10)} raw  │ ${fmtBytes(gzipSize(bundleBuf)).padStart(10)} gzip │ ${fmtBytes(brotliSize(bundleBuf)).padStart(10)} br`);
  console.log('');

  // ── Summary ────────────────────────────────────────────
  console.log('── SUMMARY ────────────────────────────────────────────');
  console.log(`  Source total:  ${fmtBytes(totalSrcRaw)} raw / ${fmtBytes(gzipSize(srcConcatBuf))} gzip`);
  console.log(`  Bundled:       ${fmtBytes(bundleBuf.length)} raw / ${fmtBytes(gzipSize(bundleBuf))} gzip`);
  console.log(`  Savings:       ${((1 - gzipSize(bundleBuf) / totalSrcRaw) * 100).toFixed(1)}% vs raw src`);
  console.log('');
}

build().catch(e => { console.error(e); process.exit(1); });
