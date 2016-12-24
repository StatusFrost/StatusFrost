chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			documentReady();
			clearInterval(readyStateCheckInterval);
		}
	}, 10);
	document.onkeypress = keyPressListener;
});
function keyPressListener(e) {
	chrome.extension.sendMessage({type:"keypress"})
}

function documentReady() {
	chrome.extension.sendMessage({type:"pageLoad", sslUsed: location.protocol === 'https:', domain: window.location.hostname})	
}
