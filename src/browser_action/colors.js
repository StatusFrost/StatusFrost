
const COLORS = [
    "#727272",
    "#f1595f",
    "#79c36a",
    "#599ad3",
    "#f9a65a",
    "#9e66ab",
    "#cd7058",
    "#3366CC",
    "#DC3912",
    "#FF9900",
    "#109618",
    "#990099",
    "#3B3EAC",
    "#0099C6",
    "#DD4477",
    "#66AA00",
    "#B82E2E",
    "#316395",
    "#994499",
    "#22AA99",
    "#AAAA11",
    "#6633CC",
    "#E67300",
    "#8B0707",
    "#329262",
    "#5574A6",
    "#3B3EAC",
    "#d77fb3",
    "#1abc9c",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
    "#34495e",
    "#f39c12",
    "#e67e22",
    "#e74c3c",
    "#95a5a6",
    "#c0392b"
];
var colorIndex = 0;
function generateNextColor() {
    if(colorIndex + 1 >= COLORS.length) {
        colorIndex = 0;
    }
    return COLORS[colorIndex++];
}
