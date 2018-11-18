require('dotenv').config()

const fs = require('fs')
const stringify =  require('csv-stringify')
const Twitter = require('twitter')
const parseArgs = require('minimist')

const client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  bearer_token: process.env.BEARER_TOKEN,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

const calc = handle =>
  new Promise(async (resolve, reject) => {
    try {
      const { name, followers_count } = await client.get('users/show', { screen_name: handle })
      const { statuses } = await client.get('search/tweets', { q: 'from:' + handle + ' AND -filter:retweets AND -filter:replies', result_type: 'recent', count: 25 })

      const original_tweets_count = statuses.length
      const retweets_count = statuses.reduce(function(acc, tweet) { return acc + tweet.retweet_count }, 0)
      const rubinratio = (retweets_count / original_tweets_count) / followers_count

      resolve({
        handle,
        name,
        followers_count,
        original_tweets_count,
        rubinratio,
      })
    } catch (e) {
      reject(e)
    }
  })

const analyze = (screen_names, cb) =>
  Promise.all(screen_names.map(calc))
    .then(cb)
    .catch(error => console.error(error))

const printTable = results =>
  console.table(results
    .sort((a, b) => b.rubinratio - a.rubinratio)
    .map(r => ({ ...r, rubinratio: (r.rubinratio * 10000).toFixed(2)})))

const printCSV = results =>
  stringify(results, { header: true }).pipe(process.stdout)

const collectFollowerScreenNames = (screen_name, cursor = -1) =>
  new Promise((resolve, reject) => {
    client.get('friends/list', { screen_name, cursor, count: 200 })
      .then(({ users, next_cursor, next_cursor_str }) => {
        const user_names = users.map(u => u.screen_name)
        if (next_cursor === 0) {
          resolve(user_names)
        } else {
          collectFollowerScreenNames(screen_name, next_cursor_str)
            .then(next_user_names => resolve([ ...user_names, ...next_user_names]))
            .catch(reject)
        }
      })
      .catch(reject)
  })

const argv = parseArgs(process.argv.slice(2))
const outFn = argv.o === 'csv' ? printCSV : printTable
const analyzeFn = results => analyze(results, outFn)

if (argv.l) {
  analyzeFn(argv.l.split(','))
} else if (argv.u) {
  collectFollowerScreenNames(argv.u)
    .then(analyzeFn)
    .catch(console.error)
} else if (argv.f) {
  fs.readFile(argv.f, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
    } else {
      analyzeFn(data.split(/[\s\n,]/).filter(e => e && e.length > 0), )
    }
  })
} else {
  console.log('Usage: node rubinratio.js [options]\n  -f      input file of screen names\n  -l      comma-separated list of screen names\n  -o=csv  output results in csv format\n  -u      calculate RubinRatio for all followers of this screen name\n\nEXAMPLES\n  node rubinratio.js -h ericrweinstein,kanyewest\n  node rubinratio.js -u rubinreport -o csv')
}
