# WARP
## Tokens

Creates brand-css files from tokens. 

Uses the [Tokenizer](https://github.com/warp-ds/tokenizer) to build css vars. The output 
is css files, one for each support brand. These CSS files are what's actually holding the theme.

### Goals

The aim of this package is to automate the generation of the css and publishing it to Eik.

### Usage

If you have new components to add tokens to (if you only want to update existing tokens proceed to step 2):

1. Under applicable brand create a new yml file and preferably name it the same as the new component(e.g. button.yml if it is a button component)
2. Update tokens needed.
3. Push your changes.
4. The CSS files for each brand will be built and published to Eik. Please find your release [here](https://github.com/warp-ds/tokens/actions/workflows/release.yml) and search for the css urls which were published under `Eik login and publish` step.
! Be aware that it takes some time for Eik to update the aliased version so if you need to test your changes immediately use the full version and not an alias.

### Releases

This project uses [Semantic Release](https://github.com/semantic-release/semantic-release) to
automate package publishing when making changes to the `main` or `alpha` branch.

It is recommended to branch off the `alpha` branch. Make sure `alpha` branch is 
updated with the latest `main`. 
Follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)
when making changes. When your changes are ready for pull request, this should be 
opened against the `alpha` branch.

Please note that the version published will depend on your commit message
structure. You can use [commitizen](https://github.com/commitizen/cz-cli) to help
follow this structure:

```
npm install -g commitizen
```

When installed, you should be able to type `cz` or `git cz` in your terminal to
commit your changes (replacing `git commit`).

[![Add and commit with Commitizen](https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png)](https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png)
