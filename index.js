var config = require('./config')
  , CoinJar = require('coinjar')
  , coinjar = new CoinJar(config.coinjar)
  , Pushover = require('pushover-notifications')
  , pushover = new Pushover(config.pushover)
  , lastAlertedPrice = null

function sendAlert(price, callback) {
  var data = {
      title: 'CoinJar Price Alert'
    , message: 'The CoinJar spot price is ' + price + ' ' + config.currency + '.'
    , sound: config.sound
  }
  pushover.send(data, function(err, result) {
    lastAlertedPrice = price
  })
}

;(function checkPrice() {
  coinjar.personal.fair_rate(config.currency, function(err, data) {
    if(err) return
    var price = parseFloat(data['spot'])

    if(lastAlertedPrice === null) return sendAlert(price)

    var change = (price - lastAlertedPrice) / lastAlertedPrice;
    if(Math.abs(change) > config.alertChange) {
      sendAlert(price)
    }
  })
  setTimeout(checkPrice, config.scanPeriod)
})()
