// Create screen canvas
let c = document.getElementById("maincv");
let ctx = c.getContext("2d");

c.width = 1024;
c.height = 1024;

function randInt(min, max) {
    return min + Math.round(Math.random() * (max - min));
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function replaceAt(string, index, replacement) {
    return string.substring(0, index) + replacement + string.substring(index + replacement.length);
}