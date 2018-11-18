require('dotenv').config()

const fs = require('fs')
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

const analyze = handles =>
  Promise.all(handles.map(calc))
    .then(display)
    .catch(error => console.error(error))


const display = results =>
  console.table(results
    .sort((a, b) => b.rubinratio - a.rubinratio)
    .map(r => ({ ...r, rubinratio: (r.rubinratio * 10000).toFixed(2)})))

const argv = parseArgs(process.argv.slice(2))

if (argv.h) {
  analyze(argv.h.split(','))
} else if (argv.f) {
  fs.readFile(argv.f, 'utf8', (err, data) => {
    if (err) {
      console.error(err)
    } else {
      analyze(data.split(/[\s\n,]/).filter(e => e && e.length > 0))
    }
  })
} else {
  console.log('Usage: node rubinratio.js [options]\n  -f  input file of handles\n  -h  comma-separated list of handles\n\nEXAMPLES\n  node rubinratio.js -h ericrweinstein,kanyewest')
}
