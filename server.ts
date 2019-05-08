'use strict';

import * as http from 'http';
import * as fs from 'fs';
import * as url from 'url';
import * as path from 'path';

const contentTypes: Map<string, string> = new Map<string, string>();
contentTypes.set('html', 'text/html');
contentTypes.set('js', 'text/javascript');
contentTypes.set('css', 'text/css');
contentTypes.set('json', 'application/json');
contentTypes.set('png', 'image/png');
contentTypes.set('jpg', 'image/jpg');
contentTypes.set('gif', 'image/gif');


function getFileName(reqUrl: url.UrlWithParsedQuery): string {
    return reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname.split('/')[1];
}

http.createServer(function (req: http.IncomingMessage, res: http.ServerResponse): void {
    const reqUrl: url.UrlWithParsedQuery = url.parse(req.url, true);
    const fileName: string = getFileName(reqUrl);
    const ext: string = path.extname(fileName).substring(1);
    const cType: string = contentTypes.get(ext);

    fs.readFile(fileName, function(err: any, data: string | Buffer) {
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
