var config = require('./config')
  , CoinJar = require('coinjar')
  , coinjar = new CoinJar(config.coinjar)
  , Pushover = require('pushover-notifications')
  , pushover = new Pushover(config.pushover)
  , lastAlertedPrice = null

function sendAlert(price, change) {

  var priceStr = price.toFixed(config.decimalPlaces)
    , changeStr = ' (' + (change < 0 ? '↓' : '↑') +
                  Math.abs(change).toFixed(config.decimalPlaces) + ') '
  var data = {
      title: 'CoinJar Price Alert'
    , message: 'The CoinJar spot price is ' + priceStr + changeStr +
               config.currency + '.'
    , sound: change > 0 ? config.sounds.rise : config.sounds.fall
  }

  pushover.send(data, function(err, result) {
    if(err) return console.log(err)
    lastAlertedPrice = price
  })

}

;(function checkPrice() {

  coinjar.personal.fair_rate(config.currency, function(err, data) {

    if(err) return console.log(err)

    var price = parseFloat(data['spot'])

    if(lastAlertedPrice === null) return lastAlertedPrice = price

    var change = price - lastAlertedPrice
      , changePercent = 100 * change / lastAlertedPrice
    if(Math.abs(changePercent) > config.alertChangePercent) {
      sendAlert(price, change)
    }

  })

  setTimeout(checkPrice, config.scanPeriod)

})()
