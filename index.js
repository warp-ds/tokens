import tokenize from '@warp-ds/tokenizer'
import slugify from '@sindresorhus/slugify'
import fs from 'node:fs'
import path from 'node:path'
import { minify } from './css-minify.js'
import drnm from 'drnm'
import postcss from 'postcss'
import atImport from 'postcss-import'

const __dirname = drnm(import.meta.url)
const outPath = path.join(__dirname, './dist')
fs.mkdirSync(outPath, { recursive: true })

async function process(tld) {
  const slugifiedName = slugify(tld)
  const filename = path.join(outPath, slugifiedName) + '.css';

  const fontDefinitions = `@import "@warp-ds/fonts/${slugifiedName}.css";`
  const tokens = tokenize(`./tokens/${tld}`);
  const css = `${fontDefinitions}${tokens}`;

  const plugins = [
    atImport
  ]
  const result = await postcss(plugins).process(css, { from: undefined, to: filename })

  fs.writeFileSync(filename, minify(result.css), { encoding: 'utf-8' })
}

process('finn.no')
process('blocket.se')
process('tori.fi')
