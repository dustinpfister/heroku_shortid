// using the http module
let http = require('http'),
fs = require('fs-extra'),
path = require('path'),
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

            reject('not a post request');

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

                reject('Please do not do that, thank you. ( body length limit: ' +
                    conf.maxBodyLength + ')');

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

                reject('could not parse body.');

            }

        });

    });

},

// check for the given id
idCheck = function (id) {

    return new Promise(function (resolve, reject) {

        fs.ensureDir('./users').then(function () {

            let dir = path.join('./users', 'user_' + id + '.json');

            fs.readFile(dir, 'utf-8').then(function (user) {

                resolve(JSON.parse(user));

            }).catch (function (e) {

                reject(e.message);

            });

        }).catch (function (e) {

            reject(e.message);

        });

    });

},

// check for the given id
idNew = function () {

    return new Promise(function (resolve, reject) {

        return fs.ensureDir('./users').then(function () {

            let id = shortId.generate(),
            now = new Date(),
            user = {

                id: id,
                visit: {

                    count: 1,
                    first: now,
                    last: now

                }

            },
            dir = path.join('./users', 'user_' + id + '.json');

            return fs.writeFile(dir, JSON.stringify(user), 'utf-8').then(function () {

                resolve(user);

            }).catch (function (e) {

                reject(e.message);

            });

        }).catch (function (e) {

            reject(e.message);

        });

    });
},

// check Body
checkBody = function (body) {

    return new Promise(function (resolve, reject) {

        if (body.action) {

            // if log set action
            if (body.action === 'log-set') {

                if (body.id) {

                    // check for that id
                    idCheck(body.id).then(function (user) {

                        resolve({

                            success: true,
                            mess: 'log-set action.',
                            id: user.id,
                            user: user

                        });

                    }).catch (function (e) {

                        // new user
                        idNew().then(function (user) {

                            resolve({

                                success: true,
                                mess: 'log-set action.',
                                id: user.id,
                                user: user

                            });

                        }).catch (function (mess) {

                            reject(mess);

                        });

                    });

                } else {

                    // new user
                    idNew().then(function (user) {

                        resolve({

                            success: true,
                            mess: 'log-set action.',
                            id: user.id,
                            user: user

                        });

                    }).catch (function (mess) {

                        reject(mess);

                    });

                }

            } else {

                reject('unkown action.')

            }

        } else {

            reject('no action given')

        }

    });

},

// create a simple server
server = http.createServer(function (req, res) {

        if (req.method === 'POST') {

            checkReq(req).then(function () {

                return parseReq(req);

            }).then(function (result) {

                return checkBody(result.body);

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
