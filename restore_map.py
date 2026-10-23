import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

with open('map.svg', 'r', encoding='utf-8') as f:
    svg = f.read()

# Replace the img tag
# Let's use a regex to match it in case of whitespace
pattern = re.compile(r'<img[^>]*class="map-bg"[^>]*>')
if pattern.search(html):
    html = pattern.sub(svg, html)
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(html)
    print("Replaced img with inline SVG")
else:
    print("Could not find the map-bg img tag")
