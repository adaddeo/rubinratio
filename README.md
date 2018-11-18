# RubinRatio

Calculates RubinRatios for Twitter users as originally proposed by Eric Weinstein in this [tweet](https://twitter.com/EricRWeinstein/status/1063109239579627521).

## Getting Started

### Installation

1. Install [node](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/lang/en/docs/install)
2. Clone this repo with
`git clone git://github.com/adaddeo/rubinratio.git`
3. Install dependencies with `yarn install`

### Configuration

1. Create a `.env` file in the project root with variables:
  ```
  CONSUMER_KEY=
  CONSUMER_SECRET=
  ACCESS_TOKEN_KEY=
  ACCESS_TOKEN_SECRET=
  ```
  These can be obtained by signing up for a developer account with [Twitter](https://developer.twitter.com/en/docs/basics/developer-portal/guides/apps).

  You can optionally omit `ACCESS_TOKEN_KEY` and `ACCESS_TOKEN_SECRET` and supply a `BEARER_TOKEN` instead for increased api rate limits (see [docs](https://developer.twitter.com/en/docs/basics/authentication/guides/bearer-tokens.html)).

### Usage

```
node rubinratio.js [options]
  -f  input file of handles
  -h comma-separated list of handles

EXAMPLES
  node rubinratio.js -h ericrweinstein,kanyewest
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
