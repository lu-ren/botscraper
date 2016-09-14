global.casper = require('casper').create({
        verbose: true,
        logLevel: 'warning',
        pageSettings: {
             loadImages:  false,         // The WebPage instance used by Casper will
             loadPlugins: false,         // use these settings
             userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
        }
    }),
    config = require('./config'),
    targets = require('./input'),
    stackshare_mod = require('./scraper_modules/stackshare.js');

casper.on('error', function(msg, backtrace) {
  this.echo("=========================");
  this.echo("ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

casper.on('page.error', function(msg, backtrace) {
  this.echo("=========================");
  this.echo("PAGE.ERROR:");
  this.echo(msg);
  this.echo(backtrace);
  this.echo("=========================");
});

//Catch messages from remote evaluate function
casper.on('remote.message', function(msg) {
    this.echo(msg);
});

casper.start().then(function() {
    this.echo('Starting botscraper... o<[0__0]>o')
});

//Stackshare pipe
casper.then(function() {
    targets.forEach(function(target) {
        return stackshare_mod(target.stackshare);
    });
});

casper.run(function() {
    this.echo('------Finished-------\n');
    this.exit();
});
