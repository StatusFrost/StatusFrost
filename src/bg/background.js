

//Grab settings object
var settings = new Store("settings");
var analyticsEnabled = settings.get("cb_enableAnalytics")


//Enable google analytics if analytics are enabled
if(analyticsEnabled) {
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','js/analytics.js','ga');
    ga('create', 'UA-67106116-5', 'auto');  // Replace with your property ID.
    ga('send', 'pageview');
}

//Gather keypress velocity readings at x * 1000ms interval.
var VELOCITY_INTERVAL = 3;
const CALIBRATION_SAMPLES = 5;
var samplesTaken = 0;
var avgKeyPressesPerInterval = 0;
var keyPressesWithinInterval = 0;
var intervalStart = -1;
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if(request.type && request.type == "keypress") {
        keyPressesWithinInterval++;
        var time = new Date().getTime();
        console.log(time - intervalStart);
        if(intervalStart == -1) {
            intervalStart = time;
        }
        else if(time - intervalStart >= VELOCITY_INTERVAL * 1000) {
            /*if(samplesTaken < CALIBRATION_SAMPLES) {
                avgKeyPressesPerInterval += keyPressesWithinInterval;
                console.log("Took sample!")
                samplesTaken++;
            } else if(samplesTaken == CALIBRATION_SAMPLES) {
                avgKeyPressesPerInterval /= samplesTaken;
                VELOCITY_INTERVAL = 10;
                console.log("Done!")
            } else if(keyPressesWithinInterval - avgKeyPressesPerInterval < -20) {
                console.log("Presses > 20 less than avg. Skipping.")
                return;
            }*/
            console.log("Presses: " + keyPressesWithinInterval)
            var keyVelocity = keyPressesWithinInterval * (60 / VELOCITY_INTERVAL)
            console.log(keyVelocity);
            if(keyPressesWithinInterval <= 5 * (VELOCITY_INTERVAL/3) || keyVelocity < 50) {
               console.log("Not enough presses. returning.");
               keyPressesWithinInterval = 0;
               intervalStart = time;
               keyPressesWithinInterval = 0;
               return;
           }
           intervalStart = time;
           keyPressesWithinInterval = 0;
            chrome.storage.sync.get('keyVelocity', function(result) {
                if(!result) {
                    result = {};
                } else {
                    result = result.keyVelocity;
                }
                result[time] = keyVelocity;
                chrome.storage.sync.set({'keyVelocity': result}, function() {
                    console.log(result)
                });
            })
            if(analyticsEnabled) {
                ga('send', 'event', 'Analytics Track', 'Key Pressed');
                console.log(keyVelocity)
            }
        }
    }
    sendResponse();
  });
