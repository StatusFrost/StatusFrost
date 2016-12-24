chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            documentReady();
            clearInterval(readyStateCheckInterval);
        }
    }, 10);
    document.onkeypress = keyPressListener;
});
var oldURL = window.location.href;
var urlChangeHandler = setInterval(checkURLChange, 500);

function checkURLChange() {
    var newURL = window.location.href;
    if (newURL !== oldURL) {
        documentReady();
        oldURL = newURL;
    }
}

function keyPressListener(e) {
    chrome.extension.sendMessage({
        type: "keypress"
    })
}

function documentReady() {
    chrome.extension.sendMessage({
        type: "pageLoad",
        sslUsed: location.protocol === 'https:',
        domain: window.location.hostname
    })
}
