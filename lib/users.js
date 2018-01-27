let fs = require('fs-extra'),
path = require('path'),
shortId = require('shortid'),

log = function (mess) {

    console.log(mess);

};

// write user to it's file
exports.writeToUser = function (user) {

    return new Promise(function (resolve, reject) {

        let dir = path.join('./users', 'user_' + user.id + '.json');

        fs.writeFile(dir, JSON.stringify(user), 'utf-8').then(function () {

            resolve(user);

        }).catch (function (e) {

            reject(e.message);

        });

    });

};

// update users data
exports.updateUser = function (user) {

    let self = this;

    return new Promise(function (resolve, reject) {

        let dir = path.join('./users', 'user_' + user.id + '.json');

        fs.readFile(dir, 'utf-8').then(function (user) {

            user = JSON.parse(user);

            user.visit.count += 1;
            user.visit.last = new Date();

            return self.writeToUser(user);

        }).then(function (user) {

            log('user update for: ' + user.id);

            resolve(user);

        }).catch (function (mess) {

            reject(mess);

        });

    });
};

// check for the given id
exports.idCheck = function (id) {

    log('checking for user: ' + id);

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

};

// check for the given id
exports.idNew = function () {

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

                log('new user: ' + user.id);

                resolve(user);

            }).catch (function (e) {

                reject(e.message);

            });

        }).catch (function (e) {

            reject(e.message);

        });

    });
};
