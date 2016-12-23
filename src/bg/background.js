//Grab settings object
var settings = new Store("settings");
var analyticsEnabled = settings.get("cb_enableAnalytics")


//Enable google analytics if analytics are enabled
if (analyticsEnabled) {
    (function(i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
        i[r] = i[r] || function() {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * new Date();
        a = s.createElement(o),
            m = s.getElementsByTagName(o)[0];
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m)
    })(window, document, 'script', 'js/analytics.js', 'ga');
    ga('create', 'UA-67106116-5', 'auto'); // Replace with your property ID.
    ga('send', 'pageview');
}

//Gather keypress velocity readings at x * 1000ms interval.
var VELOCITY_INTERVAL = 3;
var keyPressesWithinInterval = 0;
var intervalStart = -1;
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.type && request.type == "keypress") {
            incrementStatistic('cpm');
        }
        sendResponse();
    });

function StatTracker(name) {
    this.name = name;
    this.timer = null;
    this.valueWithinInterval = 0;
    this.minCount = 5 * (VELOCITY_INTERVAL / 3);
    this.minValue = 50;
}

var statTrackers = {};

function incrementStatistic(statisticName) {
    if (!statTrackers[statisticName]) {
        statTrackers[statisticName] = new StatTracker(statisticName);
    }
    var tracker = statTrackers[statisticName];
    tracker.valueWithinInterval++;
    if (!tracker.timer) {
        tracker.timer = setInterval(function() {
            var time = new Date().getTime();
            var statValue = tracker.valueWithinInterval;
            var avgOverTime = statValue * (60 / VELOCITY_INTERVAL)
            if (statValue <= tracker.minCount || avgOverTime < tracker.minValue) {
                console.log("Not enough samples. Skipping set.");
                tracker.valueWithinInterval = 0;
                return;
            }
            console.log(statisticName + ": " + statValue);
            tracker.valueWithinInterval = 0;
            addValue(tracker.name, time, avgOverTime)
            if (analyticsEnabled) {
                ga('send', 'event', 'Analytics Track', tracker.name);
            }

        }, VELOCITY_INTERVAL * 1000);
    }
    statTrackers[statisticName] = tracker; //Just in case...
}


function addValue(storageKey, time, value) {
    chrome.storage.sync.get(storageKey, function(result) {
        if (!result) {
            result = {};
        } else {
            result = result[storageKey];
        }
        result[time] = value;
        var setter = {};
        setter[storageKey] = result
        chrome.storage.sync.set(setter, function() {});
    })

}
