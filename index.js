casper = require('casper').create({
        verbose: true,
        logLevel: 'warning',
        pageSettings: {
             loadImages:  true,         // The WebPage instance used by Casper will
             loadPlugins: false,         // use these settings
             userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.4 (KHTML, like Gecko) Chrome/22.0.1229.94 Safari/537.4'
        },
        options: {
            waitTimeout: 10000
        }
    }),
    target = require('./input').target,
    stackshare_mod = require('./scraper_modules/stackshare'),
    siftery_mod = require('./scraper_modules/siftery');

struct = {};

casper.on('resource.requested', resourceRequested);

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
    var fs = require('fs');
    this.echo('Starting Mister Sifter... o<[0~_~0]>o');
    struct.target = target.name;
    struct.clients = [];

    var file = struct.target + '.csv';

    if (fs.isFile(file)) {
        console.log(file, ' already exists. Removing it...');
        fs.remove(file);
    }
});

//Stackshare pipe
casper.then(function() {
    console.log('Starting stackshare pipe');
    stackshare_mod(target.stackshare);
});

//Siftery pipe
casper.then(function() {
    console.log('Starting siftery pipe');
    siftery_mod();
});

casper.run(function() {
    this.echo('------Finished-------');
    this.echo('Mister Sifter bids you goodbye...0<[0~_~0]>0');
    this.exit();
});

//Suppresses image requests...workaround for load-images memory leak
function resourceRequested(requestData, request) {
    if (requestData.url.match(/\.(jpeg|jpg|gif|png|tif|tiff|mov)$/)) {
        request.abort();
    }
};
