// using the http module
let http = require('http'),
fs = require('fs-extra'),

shortId = require('shortid'),

// hard coded conf object
conf = {

    // look for PORT environment variable,
    // else look for CLI argument,
    // else use hard coded value for port 8080
    port: process.env.PORT || process.argv[2] || 8080,

    // max body length for posts
    maxBodyLength: 100

},

// basic request check
checkReq = function (req) {

    return new Promise(function (resolve, reject) {

        if (req.method != 'POST') {

            reject(JSON.stringify({

                    mess: 'not a post request',
                    success: false

                }));

        }

        resolve({

            success: true,
            mess: 'request has passed request check'

        })

    });

},

// parse body of request
parseReq = function (req) {

    return new Promise(function (resolve, reject) {

        // the array of buffer chunks
        let body = [];

        // as chunks start coming in
        req.on('data', function (chunk) {

            // push the next chunk
            body.push(chunk);

            // kill the connection if someone is posting a large
            // amount of data for whatever reason
            if (body.length > conf.maxBodyLength) {

                req.connection.destroy();

                reject(JSON.stringify({

                        mess: 'Please do not do that, thank you. ( body length limit: ' + conf.maxBodyLength + ')',
                        success: false

                    }));

            }

        });

        // when the post is received
        req.on('end', function () {

            body = Buffer.concat(body).toString();

            try {

                body = JSON.parse(body);

                resolve({

                    mess: 'body parsed',
                    success: true,
                    body: body

                });

            } catch (e) {

                reject(JSON.stringify({

                        mess: 'could not parse body.',
                        success: false

                    }));

            }

        });

    });

};

// create a simple server
let server = http.createServer(function (req, res) {

        checkReq(req).then(function () {

            return parseReq(req);

        }).then(function (result) {

            res.writeHead(200, {
                'Content-Type': 'text/plain'
            });

            res.write(JSON.stringify(result), 'utf-8');
            res.end();

        }).catch (function (result) {

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
                    res.end(e.message);

                });

            } else {

                res.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                res.end(result);

            }

        });

    });

// listen on the port
server.listen(conf.port, function () {

    console.log('app up on port: ' + conf.port);

});
