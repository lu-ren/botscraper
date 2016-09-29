var fs = require('fs'),
    sites = require('../input').sites;

var scrape = function() {
    var url = sites.siftery.baseUrl;

    casper.thenOpen(url + '/users/login', function(response) {
        var self = this;

        if (response === undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            self.exit();
        } else {
            console.log('Opened ', url, ' successfully. Starting to scrape...');
        }

        //Somehow, the cookies do not work for siftery
        //Therefore, we will not save the cookies
        if (self.exists('.login-form')) {
            console.log('Not logged in. Logging in...');
            var credentials = require('../config').siftery;

            self.waitForSelector('form', function() {
                self.fillSelectors('form', {
                    'input[name = loginEmail]': credentials.username
                });
            });

            self.waitForSelector('input[type = password]', function() {
                self.fillSelectors('form', {
                    'input[type = password]': credentials.password
                });
                self.click('button[type = submit]');
            });

            self.waitForSelector('.user-dropdown', function() {
                console.log('Successfully authenticated.');
            });
        } else {
            console.log('Already logged in');
        }
    });

    casper.then(function() {
        var self = this;

        struct.clients.forEach(function(client, index, lst) {
            var query = url + '/search?q=' + cleanName(client);

            self.thenOpen(query, function(response) {
                console.log('Querying ', query);
                if (response === undefined || response.status >= 400) {
                    console.log('Site ', query, ' failed with status ', response.status);
                    self.exit();
                }
                //Wait for 2 seconds since website is shit and 
                //gives empty results for a few seconds
                self.wait(2000, function() {
                    if (self.exists(
                                {
                                    type: 'xpath',
                                    path: '//*[@id="companies"]/ul/li/a'
                                }
                        )) {
                        console.log('Company ' + client + ' exists');
                        var href = self.getElementAttribute(
                                    {
                                        type: 'xpath',
                                        path: '//*[@id="companies"]/ul/li/a'
                                    }, 'href');
                        var clientUrl = url + href;
                        self.thenOpen(clientUrl, function(response) {
                            if (response === undefined || response.status >= 400) {
                                console.log('Site ', clientUrl, ' failed with status ', response.status);
                                self.exit();
                            }
                            console.log('Scraping ', clientUrl);

                            self.waitForSelector('.products-bucket', function() {
                                var softwares = self.evaluate(scrapeClient);
                                //Need to scrape from mattermark here
                                writeToCSV(client, softwares);
                            }, function() {
                                console.log('Unable to scrape', clientUrl);
                            });
                        });
                    } else {
                        console.log('Company ' + client + ' does not exist');
                    }
                });
            });
        });
    });
};

//Cleans target names so it can be used for search queries
//Lowercases the names and replaces spaces with pluses
var cleanName = function(name) {
    var replaced = name.split(' ').join('+');
    return replaced;
};

var writeToCSV = function(client, softwares) {
    var filename = struct.target + '.csv';
    var string = client;

    softwares.forEach(function(sectionObj) {
        var section = sectionObj.name;

        sectionObj.softwares.forEach(function(software) {
            string = string + ', ' + software + ' [ ' + section + ' ]';
        });
    });
    string += '\n';

    fs.write(filename, string, 'a');
};

var scrapeClient = function() {
    var ret = [];

    var sections = $('.fluid-section-body__inner').children();

    $(sections).each(function() {
        var elem = $(this).find('.unit-group-title');
        var section = {};
        section.name = $(elem).text();
        section.softwares = [];
        var cells = $(this).find('.cell-item');

        $(cells).each(function() {
            var nameElem = $(this).find('.product-badge__title');
            var text = $(nameElem).text();

            if (text !== undefined)
                section.softwares.push(text);
        });
        ret.push(section);
    });
    return ret;
};

module.exports = scrape;
