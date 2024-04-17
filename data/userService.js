const mongoose = require('mongoose');
let mongoDBConnectionString = "mongodb+srv://sukhadadhikari3:MofK5gmJxpipjE5k@cluster0.1iknzfi.mongodb.net/Vehicle?retryWrites=true&w=majority&appName=Cluster0";

let Schema = mongoose.Schema;

let userSchema = new Schema({
    userName: {
        type: String,
        unique: true
    },
    password: String,
    password1:String
});

let User;

module.exports.connect = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(mongoDBConnectionString);

        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });

        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
 
    return new Promise(function (resolve, reject) {

        if (userData.password != userData.password1) {
            reject("Passwords do not match");

        } else {
            let newUser = new User(userData);

            newUser.save().then(() => {
                resolve("User " + userData.userName + " successfully registered");
            }).catch(err => {
                if (err.code == 11000) {
                    reject("User Name already taken");
                } else {
                    reject("There was an error creating the user: " + err);
                }
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {

        User.find({ userName: userData.userName })
            .limit(1)
            .exec()
            .then((users) => {

                if (users.length == 0) {
                    reject("Unable to find user " + userData.userName);
                } else {
                    if (userData.password == users[0].password) {
                        resolve(users[0]);
                    } else {
                        reject("Incorrect password for user " + userData.userName);
                    }

                }
            }).catch((err) => {
                reject("Unable to find user " + userData.userName);
            });
    });
};