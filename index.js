import process from '@warp-ds/tokenizer'

const tokens = process('./tokens/finn.no', { minify: false })
console.log(tokens)
