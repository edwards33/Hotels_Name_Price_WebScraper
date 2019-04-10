var casper = require("casper").create({
  verbose: true,
  logLevel: 'error',     // debug, info, warning, error
  pageSettings: {
    loadImages: false,
    loadPlugins: false,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
  },
  clientScripts: ["vendor/jquery.min.js", "vendor/lodash.js"]
});

const URL = 'https://www.nestoria.de/immobilien/mieten/berlin';



var names = [];
var prices = [];

casper.selectOptionByValue = function(selector, valueToMatch){
    this.evaluate(function(selector, valueToMatch){
        var select = document.querySelector(selector),
            found = false;
        Array.prototype.forEach.call(select.children, function(opt, i){
            if (!found && opt.value.indexOf(valueToMatch) !== -1) {
                select.selectedIndex = i;
                found = true;
            }
        });
        // dispatch change event in case there is some kind of validation
        var evt = document.createEvent("UIEvents"); // or "HTMLEvents"
        evt.initUIEvent("change", true, true);
        select.dispatchEvent(evt);
    }, selector, valueToMatch);
};

function getNames() {
  var names = $('[itemprop=name]');
  return _.map(names, function(e){
    return e.innerHTML;
  });
};

function getPrices() {
  var prices = $('.result__details__price.price_click_origin');
  var temporalResults =  _.map(prices, function(e) {
    var priceTemporal = e.innerHTML;
    var priceArray = priceTemporal.split('€');
    return priceArray[0];
  });
  return _.filter(temporalResults, function(price) {
        if (price.length < 30) {
            return true;
        }
  });
};

casper.start(URL, function() {
  this.echo(this.getTitle());
});

casper.waitForSelector('.listing__title__text', function() {
  console.log('hotel-room selector is loaded' );
});

casper.then(function(){
    this.click('#agree-cookies-gdpr.btn-cookies-gdpr');

    this.selectOptionByValue('select.sort__input__field.dropdown__field', 'price_lowhigh');

    this.capture('screenshot00.png');
});

casper.wait(3000, function() {
    this.echo("I've waited for 3 seconds.");
    this.capture('screenshot01.png');
});

casper.then(function() {
  names = this.evaluate(getNames);
  prices = this.evaluate(getPrices);
});

casper.then(function() {
  var namesAndPrices = [];
  for(let i = 0; i < names.length; i++){
    namesAndPrices.push(names[i] + '- price: ' +  prices[i] + ' EURO');
  }
  this.echo(namesAndPrices.length + ' prices found: ');
  this.echo(' - ' + namesAndPrices.join('\n - ')).exit();
});

casper.run();