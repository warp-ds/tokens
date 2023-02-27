import process from 'nmp-tokenizer'

const tokens = process('./tokens/finn.no', { minify: false })
console.log(tokens)
