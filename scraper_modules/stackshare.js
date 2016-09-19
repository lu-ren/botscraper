var fs = require('fs'),
    sites = require('../input').sites;

var scrape = function(url) {
    casper.thenOpen(url, function(response) {
        if (response === undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            this.exit();
        } else {
            console.log('Opened ', url, ' successfully. Starting to scrape...');
        }
    });

    casper.then(function() {
        var self = this;

        //Need to login
        if (self.exists('#more-stacks-login')) {
            console.log('Not logged in. Logging in...');
            var baseUrl = sites.stackshare.baseUrl;
            var authRoute = '/users/auth/github';
            var authUrl = baseUrl + authRoute;

            self.thenOpen(authUrl, function(response) {
                if (response === undefined || response.status >= 400) {
                    console.log('Site ', url, ' failed with status ', response.status);
                    self.exit();
                }

                var credentials = require('../config').github;
                self.capture('test.png');

                self.waitForSelector('form', function() {
                    self.fillSelectors('form', {
                        'input[name = login]': credentials.username,
                        'input[name = password]': credentials.password
                    }, true);
                });

                self.waitForSelector('.dropdown-toggle', function() {
                    console.log('Successfully authenticated.');
                    self.open(url);
                });
            });
        } else {
            console.log('Already logged in');
        }
    });

    //Should be logged in at this point
    casper.then(function() {
        var self = this;
        var counter = 0;
        var cap = 500;
        var names = [];

        var clickHelper = function() {
            var ret = self.evaluate(scrapeClients, counter);
            counter = ret.counter;
            names = names.concat(ret.names);

            if (self.exists('#service-stacks-load-more') && counter < cap) {
                self.clickLabel('See more stacks', 'a');
                self.then(clickHelper);
            }
        };

        clickHelper();

        self.then(function() {
            struct.clients = names;
        });
    });
};

var scrapeClients = function(counter) {
    var children = $('.companies-using-service').children();
    var names = [];

    while (counter < children.length) {
        child = children[counter];
        var name = $(child).find('a').attr('data-hint');
        names.push(name);
        counter++;
    }
    return {
        counter: counter,
        names: names
    };
};

module.exports = scrape;
