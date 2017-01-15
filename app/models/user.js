// app/models/user.js
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var configDB = require.main.require('./config/database.js');
var conn = mongoose.createConnection(configDB.heroku_mlab_db_URL);

var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local: {
        email: {
            type: String,
            index: {
                unique: true,
                dropDups: true
            }
        },
        password: String,
        displayName: String,
        avatar: {
            type: String,
            default: "./img/user.png"
        },
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    facebook: {
        id: String,
        token: String,
        email: String,
        displayName: String,
        avatar: String,
        familyName: String,
        givenName: String,
        gender: String,
        ageMin: Number,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    twitter: {
        id: String,
        token: String,
        email: String,
        name: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    google: {
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        language: String,
        email: String,
        gender: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    linkedin: {
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    instagram: {
        id: String,
        displayName: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    reddit: {
        id: String,
        displayName: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    amazon: {
        id: String,
        displayName: String,
        avatar: String,
        email: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    },
    wechat: {
        id: String,
        displayName: String,
        avatar: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                question_id: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'questionAnswer'
                },
                favorite: Boolean,
                ask_time: Date
            }
        ],
        interest: [String]
    }
}, {strict: true});

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
    var user = this;

    // hash the password
    bcrypt.hash(password, null, null, function(err, hash) {
        if (err)
            return next(err);

        user.local.password = hash;
    });

};

// create the model for users and expose it to our app
module.exports = conn.model('User', userSchema);
