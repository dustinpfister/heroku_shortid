let users = require('./users.js');

// basic request check
exports.checkReq = function (req) {

    return new Promise(function (resolve, reject) {

        if (req.method != 'POST') {

            reject('not a post request');

        }

        resolve({

            success: true,
            mess: 'request has passed request check'

        })

    });

};

// parse body of request
exports.parseReq = function (req) {

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

};

let actions = {

    // get or create a new user, and return that user account
    logset: function (body) {

        return new Promise(function (resolve, reject) {

            if (body.id) {

                // check for that id
                users.idCheck(body.id).then(function (user) {

                    return users.updateUser(user);

                }).then(function (user) {

                    resolve({

                        success: true,
                        mess: 'log-set action with old user that was found.',
                        id: user.id,
                        user: user

                    });

                }).catch (function (e) {

                    // new user
                    users.idNew().then(function (user) {

                        resolve({

                            success: true,
                            mess: 'log-set action with new user becuase the given user was not found',
                            id: user.id,
                            user: user

                        });

                    }).catch (function (mess) {

                        reject(mess);

                    });

                });

            } else {

                // new user if no id is given
                users.idNew().then(function (user) {

                    resolve({

                        success: true,
                        mess: 'log-set action done with new user, becuase no id was given.',
                        id: user.id,
                        user: user

                    });

                }).catch (function (mess) {

                    reject(mess);

                });

            }

        });

    },

    // userset request
    userset: function (body) {

        return new Promise(function (resolve, reject) {

            users.idCheck(body.id).then(function (user) {

                // set whatever is given with userset
                user.userset = body.userset;

                return users.writeToUser(user);

            }).then(function (user) {

			console.log('???');
			
                resolve({

                    success: true,
                    mess: 'userset action',
                    id: user.id,
                    user: user

                });

            }).catch (function (mess) {

                reject(mess);

            });

            /*
            resolve({

            success: true,
            mess: 'update action',
            id: '',
            user: ''

            });
             */
        })

    }

}

// check Body
exports.checkBody = function (body) {

    return new Promise(function (resolve, reject) {

        if (body.action) {

            if (actions[body.action]) {

                console.log('running action: ' + body.action);

                actions[body.action](body).then(function (result) {

                    resolve(result);

                }).catch (function (mess) {

                    reject(mess);

                });

            } else {

                reject('unkown action')

            }

            /*
            // if log set action
            if (body.action === 'logset') {

            if (body.id) {

            // check for that id
            users.idCheck(body.id).then(function (user) {

            return users.updateUser(user);

            }).then(function (user) {

            resolve({

            success: true,
            mess: 'log-set action.',
            id: user.id,
            user: user

            });

            }).catch (function (e) {

            // new user
            users.idNew().then(function (user) {

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
            users.idNew().then(function (user) {

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

             */

        } else {

            reject('no action given')

        }

    });

};
