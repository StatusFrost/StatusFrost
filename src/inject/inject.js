chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval);
			document.onkeypress = keyPressListener;
		}
	}, 10);
});
function keyPressListener(e) {
	chrome.extension.sendMessage({type:"keypress"})
}
