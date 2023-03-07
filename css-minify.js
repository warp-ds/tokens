import * as lightning from 'lightningcss'

export const minify = css => {
  const { code } = lightning.transform({
    code: Buffer.from(css),
    minify: true,
    targets: {
      safari: (13 << 16)
    }
  })

  return code.toString()
}
