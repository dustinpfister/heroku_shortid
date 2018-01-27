// using the http module
let http = require('http'),
fs = require('fs-extra'),
path = require('path'),
shortId = require('shortid'),


post = require('./lib/post.js');

// hard coded conf object
conf = {

    // look for PORT environment variable,
    // else look for CLI argument,
    // else use hard coded value for port 8080
    port: process.env.PORT || process.argv[2] || 8080,

    // max body length for posts
    maxBodyLength: 100

},

// create a simple server
server = http.createServer(function (req, res) {

        if (req.method === 'POST') {

            post.checkReq(req).then(function () {

                return post.parseReq(req);

            }).then(function (result) {

                return post.checkBody(result.body);

            }).then(function (result) {

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });

                res.write(JSON.stringify(result), 'utf-8');
                res.end();

            }).catch (function (mess) {

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end(JSON.stringify({
                        success: false,
                        mess: mess,
                        id: '',
                        user: ''
                    }));

            });

        } else {

            if (req.method === 'GET' && req.url === '/') {

                fs.readFile('./public/index.html', 'utf-8').then(function (html) {

                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write(html, 'utf-8');
                    res.end();

                }).catch (function (e) {

                    res.writeHead(200, {
                        'Content-Type': 'text/plain'
                    });
                    res.end(JSON.stringify({
                            success: false,
                            mess: e.message,
                            id: '',
                            user: ''
                        }));

                });

            } else {

                res.end();

            }

        }

    });

// listen on the port
server.listen(conf.port, function () {

    console.log('app up on port: ' + conf.port);

});
