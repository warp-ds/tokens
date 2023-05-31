import tokenize from '@warp-ds/tokenizer'
import slugify from '@sindresorhus/slugify'
import fs from 'node:fs'
import path from 'node:path'
import { minify } from './css-minify.js'
import drnm from 'drnm'

const __dirname = drnm(import.meta.url)
const outPath = path.join(__dirname, './dist')
fs.mkdirSync(outPath, { recursive: true })

function process(tld) {
  const tokens = tokenize(`./tokens/${tld}`);
  const css = minify(tokens);
  const filename = path.join(outPath, slugify(tld)) + '.css';
  const fontsImport = `@import'https://assets.finn.no/pkg/@warp-ds/fonts/v1/${path.basename(filename)}';`
  fs.writeFileSync(filename, `${fontsImport}${css}`, 'utf-8');
}

process('finn.no')
process('blocket.se')
process('tori.fi')
