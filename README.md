# Tokens

This repo imports colour variables/tokens from Figma using Figma's API, and uses Style Dictionary to transform those tokens to CSS, Android and iOS.

## How to use

Use the GitHub Actions to create a PR with updated token files:

- [Fetch Warp tokens](https://github.com/warp-ds/tokens/actions/workflows/fetch-warp.yml)
- [Fetch dataviz tokens](https://github.com/warp-ds/tokens/actions/workflows/fetch-dataviz.yml)

If there's any changes in the tokens files the workflows will run a build, commit updated code and open a pull request for review.
