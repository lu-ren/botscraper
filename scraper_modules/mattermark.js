var sites = require('../input').sites,
    fs = require('fs');

var scrape = function(company) {
    var url = sites.mattermark.baseUrl + '/public/search/companies?term=' + company;

    casper.thenOpen(url, function(response) {
        var self = this;

        if (response === undefined || response.status >= 400) {
            console.log('Site ', url, ' failed with status ', response.status);
            return;
        }
        var domain = JSON.parse(self.fetchText('pre'))[0].domain;
        var companyUrl = sites.mattermark.baseUrl + '/companies/' + domain;

        self.thenOpen(companyUrl, function(response) {
            if (response === undefined || response.status >= 400) {
                console.log('Site ', companyUrl, ' failed with status ', response.status);
                return;
            }
            self.evaluate(scrapeInfo);
        });
    });
};

var scrapeInfo = function() {
    var retObj = {};

    //Getting tags
    try {
        var tags = [];
        $('.pill').each(function() {
            tags.push($(this).text());
        });

        retObj.tags = tags;
    } catch(err) {
        console.log('Cannot get tags');
    }

    //Getting quickfacts
    try {
        $('.qf-cell').each(function() {
            var label = $(this).find('.data-label').text();
            var value = $(this).find('p').text();
            retObj.label = value;
        });
    } catch(err) {
        console.log('Cannot get quickfacts');
    }

    //Getting the CMO if it exists
    try {
        $('.person').each(function() {
            var title = $(this).find('.p-title').text();

            if (title.indexOf('CMO') !== -1) {
                var name = $(this).find('a').text();
                retObj.CMO = name;
            }
        });
    } catch(err) {
        console.log('Cannot get CMO');
    }

    //Getting similar companies if exists
    try {
        var similarity = $('.similar-companies').find('li.active > a[role="tab"]').text();
        var company = $('.similar-companies').find('.name').text();
        retObj.similar = {
            similarity: similarity,
            company: company
        };
    } catch(err) {
        console.log('Cannot get similar companies');
    }

    //Getting funding history if exists
    try {
        var funding = [];
        $('.funding').each(function() {
            var fundingInfo = $(this).find('h3 > span').text();
            if (fundingInfo.indexOf('Undisclosed') === -1) {
                var fundingDate = $(this).find('.data-label').text();
                funding.push({
                    info: fundingInfo,
                    date: fundingDate
                });
            }
        });
        retObj.funding = funding;
    } catch(err) {
        console.log('Cannot get funding history');
    }

    //Getting web traffic
    try {
        var trafficInfo = $('#webtraffic-container > div > div > div > div.pane-picker.col-md-4.col-xs-12 > div.pane-option.active > p').text();
        var inboundInfo = $('#webtraffic-container > div > div > div > div.pane-picker.col-md-4.col-xs-12 > div:nth-child(2) > p').text();
        retObj.trafficInfo = trafficInfo;
        retObj.inboundInfo = inboundInfo;
    } catch (err) {
        console.log('Cannot get web traffic');
    }

    //Getting social media info
    try {
        var twitterFollowers = $('#social-container > div > div > div > div.tab-pane.fade.active.in > div.container-fluid > div > div:nth-child(2) > p').text();
        var twitterMentions = $('#social-container > div > div > div > div.tab-pane.fade.active.in > div.container-fluid > div > div:nth-child(3) > p').text();
        var facebookLikes = $('#social-container > div > div > div > div.tab-pane.fade.active.in > div.container-fluid > div > div:nth-child(2) > p').text();
        var facebookTalking = $('#social-container > div > div > div > div.tab-pane.fade.active.in > div.container-fluid > div > div:nth-child(3) > p').text();
        var linkedInFollowers = $('#social-container > div > div > div > div.tab-pane.fade.active.in > div.container-fluid > div > div:nth-child(2) > p').text();
        retObj.social = {
            twitter: {
                followers: twitterFollowers,
                mentions: twitterMentions
            },
            facebook: {
                likes: facebookLikes,
                talking: facebookTalking
            },
            linkedIn: {
                followers: linkedInFollowers
            }
        };
    } catch(err) {
        console.log('Cannot get social media');
    }

    return retObj;
};

module.exports = scrape;
