var fs = require('fs');

var currentUrl;

var scrape = function(url) {
    casper.thenOpen(url, function(response) {
        if (response == undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            this.exit();
        } else {
            console.log('Opened ', url, ' successfully. Starting to scrape...');
            currentUrl = this.getCurrentUrl();
        }
    });

    casper.then(function() {
        if (this.exists('#more-stacks-login')) {
            console.log('Not logged in');
            this.clickLabel('Login to see more stacks', 'a');
        }
    });
    
    casper.waitFor(function check() {
        return this.exists('.continue-with-gh');
    });

    casper.then(function() {
        console.log('Dialog popped up');
        //this.clickLable('Continue with GitHub', 'div');
    });
};

module.exports = scrape;
