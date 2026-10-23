const fs=require('fs'); let h=fs.readFileSync('public/index.html', 'utf8'); h=h.replace('viewport-fit=cover\">`n<meta', 'viewport-fit=cover\">\n<meta'); fs.writeFileSync('public/index.html', h);
