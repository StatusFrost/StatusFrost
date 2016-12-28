var mouseDelay = 500;
var minMouseMovement = 100;
var mouseX = 0;
var mouseY = 0;
var lastMouseX = 0;
var lastMouseY = 0;
chrome.extension.sendMessage({}, function(response) {
    var readyStateCheckInterval = setInterval(function() {
        if (document.readyState === "complete") {
            documentReady();
            clearInterval(readyStateCheckInterval);
        }
    }, 10);
    setInterval(movementUpdate, mouseDelay);
    document.onkeypress = keyPressListener;
    document.onclick = clickListener
    document.onmousemove = mouseMoveListener;
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

function clickListener(e) {
    chrome.extension.sendMessage({
        type: "click",
        x: e.pageX,
        y: e.pageY
    });
}


function mouseMoveListener(e) {
    mouseX = e.pageX,
    mouseY = e.pageY
}

function movementUpdate() {
    var dX = mouseX - lastMouseX;
    var dY = mouseY - lastMouseY;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
    if((dX * dX) + (dY * dY) >= minMouseMovement * minMouseMovement) {
        chrome.extension.sendMessage({
            type: "mouse_move_delta",
            dX: dX * dX,
            dY: dY * dY
        })
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
