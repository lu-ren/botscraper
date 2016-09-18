var fs = require('fs'),
    sites = require('../input').sites;

var scrape = function() {
    var url = sites.siftery.baseUrl;

    casper.thenOpen(url + '/users/login', function(response) {
        if (response === undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            this.exit();
        } else {
            console.log('Opened ', url, ' successfully. Starting to scrape...');
        }

        //Somehow, the cookies do not work for siftery
        //Therefore, we will not save the cookies
        if (this.exists('.login-form')) {
            this.capture('test.png');
            console.log('Not logged in. Logging in...');
            var credentials = require('../config').siftery;

            this.waitForSelector('form', function() {
                this.fillSelectors('form', {
                    'input[name = loginEmail]': credentials.username
                });
            });

            this.waitForSelector('input[type = password]', function() {
                this.fillSelectors('form', {
                    'input[type = password]': credentials.password
                });
                this.click('button[type = submit]');
            });

            this.waitForSelector('.user-dropdown', function() {
                console.log('Successfully authenticated.');
            });
        } else {
            console.log('Already logged in');
        }
    });

    casper.then(function() {
        struct.clients.forEach(function(client) {
            var query = cleanName(client);
            console.log(query);
        });
    });
};

//Cleans target names so it can be used for search queries
//Lowercases the names and replaces spaces with pluses
var cleanName = function(name) {
    var replaced = name.split(' ').join('+');
    replaced = replaced.toLowerCase();
    return replaced;
};

module.exports = scrape;
