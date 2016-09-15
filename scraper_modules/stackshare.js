var fs = require('fs'),
    sites = require('../input').sites;

var scrape = function(url) {
    casper.thenOpen(url, function(response) {
        if (response == undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            this.exit();
        } else {
            console.log('Opened ', url, ' successfully. Starting to scrape...');
        }
    });

    casper.then(function() {
        //Need to login
        if (this.exists('#more-stacks-login')) {
            console.log('Not logged in. Logging in...');
            var baseUrl = sites.stackshare.baseUrl;
            var authRoute = '/users/auth/github';
            var authUrl = baseUrl + authRoute;

            this.thenOpen(authUrl, function(response) {
                if (response == undefined || response.status >= 400) {
                    console.log('Site ', url, ' failed with status ', response.status);
                    this.exit();
                }

                var credentials = require('../config').github;

                this.waitForSelector('form', function() {
                    this.fillSelectors('form', {
                        'input[name = login]': credentials.username,
                        'input[name = password]': credentials.password
                    }, true);
                });

                this.waitForSelector('.dropdown-toggle', function() {
                    var cookies = JSON.stringify(phantom.cookies);
                    fs.write('cookies.json', cookies, 644);
                    fs.write('test.html', this.getHTML(), 'w');
                    console.log('Successfully authenticated. Saving cookies...');
                    this.open(url);
                });
            });
        } else {
            console.log('Already logged in');
        }
    });

    //Should be logged in at this point
    casper.then(function() {
        var counter = 0;
        var cap = 500;

        while (this.exists('#service-stacks-load-more'))
            this.evaluate(scrapeClients, counter);
    });
};

var scrapeClients = function(counter) {
    var children = $('.companies-using-service').children();

    while (counter < children.length) {
        child = children[counter];
        console.log($(child).find('a').attr('data-hint'));
        counter++;
    }
}

module.exports = scrape;
