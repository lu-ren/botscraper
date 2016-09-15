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
                this.then(function() {
                    var cookies = JSON.stringify(phantom.cookies);
                    fs.write('cookies.json', cookies, 644);
                })
            });
        } else {
            console.log('Already logged in');
        }
    });
};

module.exports = scrape;
