# WARP
## Tokens
Creates brand-css files from tokens. 

Uses the [Tokenizer](https://github.com/warp-ds/tokenizer) to build css var's. The output 
is css files, one for each support brand. These CSS files are whats actually holding the theme.


### Goals
The aim of this package is to automate the generation of the css and publishing it to Eik.

### Releases
This project uses

[Semantic Release](https://github.com/semantic-release/semantic-release) to
automate package publishing when making changes to the `main` or `alpha` branch.

It is recommended to branch off the `alpha` branch. Make sure `alpha` branch is 
updated with the latest `main`. 
Follow [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary)
when making changes. When your changes are ready for pull request, this should be 
opened against the `alpha` branch.


Please note that the version published will depend on your commit message
structure. You can use [commitizen](https://github.com/commitizen/cz-cli) to help
follow this structure:

[Eik Semantic Release Plugin](https://github.com/eik-lib/semantic-release)
This project uses This plugin will first determine if a repo has changes to relevant 
files before versioning and publishing these files to an Eik server.

```
npm install -g commitizen
```

When installed, you should be able to type `cz` or `git cz` in your terminal to
commit your changes (replacing `git commit`).

[![Add and commit with Commitizen](https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png)](https://github.com/commitizen/cz-cli/raw/master/meta/screenshots/add-commit.png)
