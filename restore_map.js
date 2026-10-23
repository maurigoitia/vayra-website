const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf-8');
const svg = fs.readFileSync('map.svg', 'utf-8');

const regex = /<img[^>]*class="map-bg"[^>]*>/;
if (regex.test(html)) {
    html = html.replace(regex, svg);
    fs.writeFileSync('index.html', html);
    console.log("Replaced img with inline SVG");
} else {
    console.log("Could not find the map-bg img tag");
}
