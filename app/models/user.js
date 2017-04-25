// app/models/user.js

'use strict'

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const appRoot = require('app-root-path');
const configDB = require(appRoot + '/config/database.js');

const conn = mongoose.createConnection(configDB.userDB_URL);
const bcrypt = require('bcrypt-nodejs');

// define the schema for our user model
const userSchema = mongoose.Schema({
    type: String,
    privacy: {
        basic_information: {
            type: Boolean,
            default: false
        },
        personality_assessement: {
            type: Boolean,
            default: false
        },
        stats_and_analysis: {
            type: Boolean,
            default: false
        },
        question_log: {
            type: Boolean,
            default: false
        }
    },
    ask_history: [
        {
            question_body: {
                type: String
            },
            favorite: {
                type: Boolean,
                default: false
            },
            answer_body: {
                type: String
            },
            ask_time: {
                type: Date,
                default: Date.now
            },
            ask_count: {
                type: Number,
                default: 1
            },
            question_concept: [
                {
                    type: mongoose.Schema.Types.Mixed
                }
            ],
            question_entitie: [
                {
                    type: mongoose.Schema.Types.Mixed
                }
            ],
            question_taxonomy: [
                {
                    type: mongoose.Schema.Types.Mixed
                }
            ],
            question_keyword: [
                {
                    type: mongoose.Schema.Types.Mixed
                }
            ]
        }
    ],
    interest: [mongoose.Schema.Types.Mixed],
    interest_manual: [mongoose.Schema.Types.Mixed],
    inbox: [mongoose.Schema.Types.Mixed],
    personality_assessement: {
        last_upload_time: {
            type: Date,
            default: Date.now
        },
        description_content: String,
        evaluation: mongoose.Schema.Types.Mixed
    },
    local: {
        email: {
            type: String
        },
        password: String,
        first_name: String,
        last_name: String,
        displayName: String,
        avatar: {
            type: String,
            default: "./avatar/user.png"
        },
        create_date: {
            type: Date,
            default: Date.now
        },
        role: {
            type: String,
            default: "student"
        },

        resetPasswordToken: {
            type: String,
            default: null
        },
        resetPasswordExpires: {
            type: Date,
            default: null
        },
        account_status: {
            type: String,
            default: "inactive"
        },
        account_activation_code: String
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
        }
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
        }
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
        }
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
        }
    },
    submitted_assessment_history: [
        {
            _id: {
                type: mongoose.Schema.ObjectId,
                auto: true
            },
            request_time: {
                type: Date,
                default: Date.now
            },
            user_viewed_before_change:{type:Boolean, default:true},
            view_section: Array,
            question: Array,
            question_comment: Array,
            personality_evaluation: Array,
            personality_evaluation_comment: Array,
            interest: Array,
            interest_comment: Array,
            introduction: String,
            introduction_comment: Array,
            reviewer: Array,
            comment_summary: Array,
            advisor_last_comment_time: {
                type: Date,
                default: null
            },
            advisor_last_comment_list: {
                type: Array,
                default: []
            },
            owner_display_name:String
        }
    ],
    received_assessment_history: [
        {
            assessment_type: String,
            from_user_id: String,
            assessment_id: String
        }
    ],
    inbox_trash: [mongoose.Schema.Types.Mixed]
}, {strict: true});

// checking if password is valid using bcrypt
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// this method hashes the password and sets the users password
userSchema.methods.hashPassword = function(password) {
    const user = this;
    bcrypt.hash(password, null, null, function(err, hash) {
        user.local.password = hash;
    });
};

// create the model for users and expose it to our app
module.exports = conn.model('User', userSchema);
