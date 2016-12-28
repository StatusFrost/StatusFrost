var statistics = [];
const BUCKET_SIZE = 5;
var devicePixelRatio = window.devicePixelRatio || 1;
var dpi_x = document.getElementById('testdiv').offsetWidth * devicePixelRatio;
var dpi_y = document.getElementById('testdiv').offsetHeight * devicePixelRatio;
Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(elem) {
    elem.onclick = function() {
        var inactive = elem.className.indexOf("active") == -1;
        if (inactive) {
            document.getElementById("title").className += "disabled";
            elem.className += " active";
            elem.setAttribute("original-value", elem.innerHTML);
            elem.innerHTML = "Back";
            Array.prototype.forEach.call(document.getElementsByClassName("btn-stat"), function(element) {
                if (element.id != elem.id)
                    element.style.display = "none"
            });
        } else {
            document.getElementById("title").className = "";
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

/*
 * Statistic
 * name - The stored name of this Statistic
 * friendlyName - The human-readable name of this Statistic
 * graphType - How will this be displayed? (number, line)
 * group - If present, this data will be grouped into a doughnut chart.
 *   default: none
 * modifier - Wherever displayed, values will be multiplied by this number.
 *   default: 1
 */
function Statistic(name, friendlyName, graphType, group, modifier) {
    this.name = name;
    this.graphType = graphType;
    this.values = [];
    this.friendlyName = friendlyName;
    this.group = group;
    this.modifier = modifier || 1;
}

statistics.push(new Statistic("cpm", "Characters per Minute", "line"));
statistics.push(new Statistic("pageviews", "Total Page Views", "number"));
statistics.push(new Statistic("totalClicks", "Total Clicks", "number"));
statistics.push(new Statistic("mouseDistanceMoved", "Mouse Distance Moved(meters)", "number", false, 1/Math.sqrt(dpi_x * dpi_y)/1000));
statistics.push(new Statistic("nonsslviews", "Unencrypted Page Views", "number", "pageViewCrypto"));
statistics.push(new Statistic("sslviews", "Encrypted Page Views", "number", "pageViewCrypto"));
statistics.push(new Statistic("category-programming", "Programming", "number", "pageViewCategory"));
statistics.push(new Statistic("category-productivity", "Productivity", "number", "pageViewCategory"));
statistics.push(new Statistic("category-search", "Search", "number", "pageViewCategory"));
statistics.push(new Statistic("category-social", "Social", "number", "pageViewCategory"));
statistics.push(new Statistic("category-gaming", "Gaming", "number", "pageViewCategory"));
statistics.push(new Statistic("category-commerce", "Commerce", "number", "pageViewCategory"));
statistics.push(new Statistic("category-news", "News", "number", "pageViewCategory"));
statistics.push(new Statistic("category-entertainment", "Entertainment", "number", "pageViewCategory"));
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
            if(resultValue) {
                if (statistic.graphType == 'number') {
                    ctx.innerHTML = round(resultValue * statistic.modifier, 2);
                } else if (statistic.graphType == 'line') {
                    var timestamps = Object.keys(resultValue);
                    var maxValues = 10 * BUCKET_SIZE;
                    renderLineChart(timestamps, resultValue, maxValues, ctx, statistic.friendlyName);
                    var maxValue = 0;
                    for(var j = 0; j < timestamps.length; j++) {
                        if(resultValue[timestamps[j]] > maxValue) {
                            maxValue = round(resultValue[timestamps[j]] * statistic.modifier, 2);
                        }
                    }
                    if(maxValue != -1) {
                        document.getElementById(statName + "MaxValue").innerHTML = maxValue
                    }
                }
            } else {
                if (statistic.graphType == 'number') {
                    ctx.innerHTML = "<h2>Not enough data collected!</h2>"
                } else {
                    ctx.getContext('2d').font = "20px Times New Roman"
                    ctx.getContext('2d').fillText('Not enough data collected!', 50, 50)
                }
            }
            iterateStatistic(i + 1);
        });
    }
}

function round(value, places) {
    return Math.round(value * Math.pow(10, places)) / Math.pow(10, places);
}

function initializeDoughnutCharts() {
    for (var i = 0; i < Object.keys(groupData).length; i++) {
        var key = Object.keys(groupData)[i];
        var group = groupData[key];
        if(key === "pageViewCrypto") {
            renderDonutChart(Object.keys(group), Object.values(group), document.getElementById(key + "Chart"), key, ['#f1595f', '#2ecc71'])
        } else {
            renderDonutChart(Object.keys(group), Object.values(group), document.getElementById(key + "Chart"), key)
        }
    }
}

function renderDonutChart(keys, values, ctx, chartName, colors) {
    var colors = colors || [];
    if(colors.length === 0) {
        for (var i = 0; i < values.length; i++) {
            colors.push(generateNextColor());
        }
    }
    var labels = [];
    var data = [];
    for(var i = 0; i < keys.length; i++) {
        if(values[i] && values[i] > 0) {
            labels.push(keys[i]);
            data.push(values[i]);
        }
    }
    var data = {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: colors,
            hoverBackgroundColor: colors
        }]
    };
    var doughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            tooltips: {
                callbacks: {
                    label: function(tooltipItem, data) {
                        var allData = data.datasets[tooltipItem.datasetIndex].data;
                        var tooltipLabel = data.labels[tooltipItem.index];
                        var tooltipData = allData[tooltipItem.index];
                        var total = 0;
                        for (var i in allData) {
                            if(allData[i]) {
                                total += allData[i];
                            }
                        }
                        var tooltipPercentage = Math.round((tooltipData / total) * 100);
                        return tooltipLabel + ': ' + tooltipData + ' (' + tooltipPercentage + '%)';
                    }
                }
            }
        }
    });
}

function renderLineChart(timestamps, resultValue, maxValues, ctx, statisticName) {
    var buckets = [];
    var start = timestamps.length - maxValues > 0 ? timestamps.length - maxValues : 0
    for (var i = start - BUCKET_SIZE; i < timestamps.length; i += BUCKET_SIZE) {
        var value = 0;
        for (var j = i; j < i + BUCKET_SIZE && j < timestamps.length; j++) {
            value += Object.values(resultValue)[j];
        }
        value /= BUCKET_SIZE;
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
                        labelString: 'Bucket(' + BUCKET_SIZE + ' samples)'
                    }
                }]
            }
        }
    });
}
