var statistics = [];
var bucketSize = 5;
Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(elem) {
    console.log(elem);
    elem.onclick = function() {
        var inactive = elem.className.indexOf("active") == -1;
        if(inactive) {
            elem.className += " active";
            elem.setAttribute("original-value", elem.innerHTML);
            elem.innerHTML = "Back";
        } else {
            elem.className = elem.className.replace(/ \bactive\b/, "");
            elem.innerHTML = elem.getAttribute("original-value")
        }
        var viewStr = elem.getAttribute("view");
        if(viewStr) {
            var view = document.getElementById(viewStr);
            if(inactive) {
                view.style.display = "inline-block";
            } else {
                view.style.display = "none";
            }
        }
    }
});

function Statistic(name, friendlyName) {
    this.name = name;
    this.values = [];
    this.friendlyName = friendlyName;
}

statistics.push(new Statistic("cpm", "Characters per Minute"))

for(var i = 0; i < statistics.length; i++) {
    var statistic = statistics[i];
    chrome.storage.sync.get(statistic.name, function(result) {
        var buckets = [];
        var resultValue = result[statistic.name];
        var timestamps = Object.keys(resultValue);
        for (var i = 0; i < timestamps.length; i += bucketSize) {
            var value = 0;
            for (var j = i; j < i + bucketSize && i + j < timestamps.length; j++) {
                value += Object.values(resultValue)[i + j];
            }
            value /= bucketSize;
            buckets.push(value);
        }
        var ctx = document.getElementById(statistic.name + "Chart");
        var valueGraph = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(buckets),
                datasets: [{
                    label: statistic.friendlyName,
                    data: buckets,
                    backgroundColor: "rgba(75,192,192,0.4)",
                    borderColor: "rgba(75,192,192,1)",
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    xAxes: [{
                      scaleLabel: {
                        display: true,
                        labelString: 'Bucket(5 samples)'
                      }
                    }]
                }
            }
        });
    });
}
