var statistics = [];
var bucketSize = 10;
Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(elem) {
    console.log(elem);
    elem.onclick = function() {
        var inactive = elem.className.indexOf("active") == -1;
        if (inactive) {
            elem.className += " active";
            elem.setAttribute("original-value", elem.innerHTML);
            elem.innerHTML = "Back";
            Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(element) {
                if (element.id != elem.id)
                    element.style.display = "none"
            });
        } else {
            elem.className = elem.className.replace(/ \bactive\b/, "");
            elem.innerHTML = elem.getAttribute("original-value");
            Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(element) {
                if (element.id != elem.id)
                    element.style.display = "inline-block"
            });
        }
        var viewStr = elem.getAttribute("view");
        if (viewStr) {
            var view = document.getElementById(viewStr);
            if (inactive) {
                view.style.display = "inline-block";
            } else {
                view.style.display = "none";
            }
        }
    }
});

function Statistic(name, friendlyName, graphType, group) {
    this.name = name;
    this.graphType = graphType;
    this.values = [];
    this.friendlyName = friendlyName;
    this.group = group;
}

statistics.push(new Statistic("cpm", "Characters per Minute", "line"));
statistics.push(new Statistic("pageviews", "Total Page Views", "number"));
statistics.push(new Statistic("nonsslviews", "Unencrypted Page Views", "number", "pageViewCrypto"));
statistics.push(new Statistic("sslviews", "Encrypted Page Views", "number", "pageViewCrypto"));
statistics.push(new Statistic("category-programming", "Programming", "number", "pageViewCategory"));
statistics.push(new Statistic("category-productivity", "Productivity", "number", "pageViewCategory"));
statistics.push(new Statistic("category-search", "Search", "number", "pageViewCategory"));
statistics.push(new Statistic("category-social", "Social", "number", "pageViewCategory"));
statistics.push(new Statistic("category-gaming", "Gaming", "number", "pageViewCategory"));
var groupData = {};
iterateStatistic();

function iterateStatistic(i) {
    i = i || 0;
    if(i >= statistics.length) {
        initializeDoughnutCharts();
        return;
    }
    var statistic = statistics[i];
    var statName = statistic.name;
    if (statistic.group) {
        if (!groupData[statistic.group]) {
            groupData[statistic.group] = {};
        }
        chrome.storage.sync.get(statName, function(result) {
            groupData[statistic.group][statistic.friendlyName] = result[statName];
            iterateStatistic(i + 1);
        });
    } else {
        chrome.storage.sync.get(statName, function(result) {
            var resultValue = result[statName];
            var ctx = document.getElementById(statName + "Chart");
            console.log(result)
            if (statistic.graphType == 'number') {
                ctx.innerHTML = "<h2>" + resultValue + "</h2>";
            } else if (statistic.graphType == 'line') {
                var timestamps = Object.keys(resultValue);
                var maxValues = 30 * bucketSize;
                renderLineChart(timestamps, resultValue, maxValues, ctx, statistic.friendlyName);
            }
            iterateStatistic(i + 1);
        });
    }
}

function initializeDoughnutCharts() {
    for (var i = 0; i < Object.keys(groupData).length; i++) {
        var key = Object.keys(groupData)[i];
        var group = groupData[key];
        renderDonutChart(Object.keys(group), Object.values(group), document.getElementById(key + "Chart"), key)
    }
}

function renderDonutChart(keys, values, ctx, chartName) {
    var colors = [];
    for (var i = 0; i < values.length; i++) {
        colors.push(generateNextColor());
    }
    var data = {
        labels: keys,
        datasets: [{
            data: values,
            backgroundColor: colors,
            hoverBackgroundColor: colors
        }]
    };
    var doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data
    });
}

function renderLineChart(timestamps, resultValue, maxValues, ctx, statisticName) {
    var buckets = [];
    var start = timestamps.length - maxValues > 0 ? timestamps.length - maxValues : 0
    for (var i = start - bucketSize; i < timestamps.length; i += bucketSize) {
        var value = 0;
        for (var j = i; j < i + bucketSize && j < timestamps.length; j++) {
            value += Object.values(resultValue)[j];
        }
        value /= bucketSize;
        if (value == 0) {
            continue;
        }
        buckets.push(value);
    }
    var valueGraph = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(buckets),
            datasets: [{
                label: statisticName,
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
                        labelString: 'Bucket(' + bucketSize + ' samples)'
                    }
                }]
            }
        }
    });
}
