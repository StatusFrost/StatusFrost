
    var ctx = document.getElementById("wpmChart");
    var background = chrome.extension.getBackgroundPage()
    var bucketSize = 3;
    var buckets = [];
    chrome.storage.sync.get('keyVelocity', function(result) {
        var keyVelocity = result.keyVelocity;
        var timestamps = Object.keys(keyVelocity);
        for(var i = 0; i < timestamps.length; i += bucketSize) {
            var value = 0;
            for(var j = i; j < i + bucketSize && i + j < timestamps.length; j++) {
                value += Object.values(keyVelocity)[i + j];
            }
            value /= bucketSize;
            buckets.push(value);
        }
        var keyVelocityGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(buckets),
                datasets: [{
                    label: 'Characters Per Minute',
                    data: buckets,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
});
