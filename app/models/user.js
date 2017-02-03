// app/models/user.js

'use strict'

var mongoose = require('mongoose');
mongoose.Promise = global.Promise;


var appRoot = require('app-root-path');
var configDB = require(appRoot + '/config/database.js');

var conn = mongoose.createConnection(configDB.userDB_URL);
var bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({
    type: String,
    local: {
        email: {
            type: String
        },
        password: String,
        frist_name: String,
        last_name: String,
        displayName: String,
        avatar: {
            type: String,
            default: "./img/user.png"
        },
        create_date: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                user_question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        interest: [
            {
                type: String
            }
        ],
        personality_assessement: [
            {
                document_name: String,
                submit_time: {
                    type: Date,
                    default: Date.now
                },
                public: Boolean,
                evaluation: mongoose.Schema.Types.Mixed
            }
        ]
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
                user_question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        interest: [
            {
                type: String
            }
        ],
        personality_assessement: [
            {
                document_name: String,
                submit_time: {
                    type: Date,
                    default: Date.now
                },
                public: Boolean,
                evaluation: mongoose.Schema.Types.Mixed
            }
        ]
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
                user_question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        interest: [
            {
                type: String
            }
        ],
        personality_assessement: [
            {
                document_name: String,
                submit_time: {
                    type: Date,
                    default: Date.now
                },
                public: Boolean,
                evaluation: mongoose.Schema.Types.Mixed
            }
        ]
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
                user_question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        interest: [String],
        personality_assessement: [
            {
                document_name: String,
                submit_time: {
                    type: Date,
                    default: Date.now
                },
                public: Boolean,
                evaluation: mongoose.Schema.Types.Mixed
            }
        ]
    },
    google: {
        id: String,
        displayName: String,
        familyName: String,
        givenName: String,
        email: String,
        avatar: String,
        gender: String,
        language: String,
        role: {
            type: String,
            default: "student"
        },
        ask_history: [
            {
                user_question_body: {
                    type: String
                },
                favorite: {
                    type: Boolean,
                    default: false
                },
                ask_time: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        interest: [String],
        personality_assessement: [
            {
                document_name: String,
                submit_time: {
                    type: Date,
                    default: Date.now
                },
                public: Boolean,
                evaluation: mongoose.Schema.Types.Mixed
            }
        ]
    },
    account_status: String,
    account_actvition_code: String
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
