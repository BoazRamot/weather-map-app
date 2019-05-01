'use strict';

const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');

// const API_WEATHER_KEY = '9de0b5dc4332f5818dd67f6cb4cdb06a';

const contentTypes = new Map();
contentTypes.set('html', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');
contentTypes.set('jpg', 'image/jpg');
contentTypes.set('gif', 'image/gif');


function getFileName(reqUrl) {
    return reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname.split('/')[1];
}

http.createServer(function (req, res) {
    const reqUrl = url.parse(req.url, true);
    const fileName = getFileName(reqUrl);
    const ext = path.extname(fileName).substring(1);
    const cType = contentTypes.get(ext);

    fs.readFile(fileName, function(err, data) {
        if(err) {
            if(err.code === 'ENOENT'){
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.write('Resource no found');
            }
            else {
                res.writeHead(500, {'Content-Type': 'text/plain'});
                res.write('Server Error');
            }
        } else {
            res.writeHead(200, {'Content-Type': cType});
            res.write(data);
        }
        res.end();
    });
}).listen(8080, function () {
    console.log('Client is available at http://localhost:8080');
});
