module.exports = {
  'questionThreshold':'0.2',
  'server_url': {
    public: '...',
    local: '...'
  },
  secretKey: '...',
  secret: '...',
  'api-auth-code':'...',
  mongoUrl: '...',
  'facebook': {
    clientID: '...',
    clientID: '...',
    callbackURL: '/users/facebook/callback'
  },
  // 'twitter': {
  //   'consumerKey': '3LMDaxawNk2L71KDz0qFfyovW',
  //   'consumerSecret': 'K4ifsbzDPS3lh0sLBPF5vh43lSmnYM0EcJtLBB5Emji0iGcAz4',
  //   'callbackURL': 'https://127.0.0.1:3443/users/twitter/callback'
  // },
  'google': {
    clientID: '...',
    clientID: '...',
    'callbackURL': '/users/google/callback'
  },

  'linkedin': {
    clientID: '...',
    clientID: '...',
    'callbackURL': '/users/linkedin/callback'
  },
  //
  // 'instagram': {
  //   clientID: '...',
  //   clientID: '...',
  //   'callbackURL': '/auth/instagram/callback'
  // },
  //
  // 'reddit': {
  //   clientID: '...',
  //   clientID: '...',
  //   'callbackURL': '/auth/reddit/callback',
  //   'avatar': '/img/reddit-icon.png'
  // },
  //
  // 'amazon': {
  //   clientID: '...',
  //   clientID: '...',
  //   'callbackURL': '/auth/amazon/callback',
  //   'avatar': '/img/amazon-icon.png'
  // },
  //
  // 'wechatAu': {
  //   clientID: '...',
  //   clientID: '...',
  //   'callbackURL': '/auth/wechat/callback',
  //   'avatar': '/img/wechat-icon.png'
  // },
  'twilio': {
    "accountSid": "...",
    authToken: '...'
  },
  'watson': {
    retrieve_and_rank: {
      username: '...',
      username: '...',
      version: 'v1'
    },
    "rrparams": {
      cluster_id: '...',
      collection_name: '...'
    },
    ranker_id: '...',
    "NaturalLanguageUnderstanding": {
      'username': '...',
      'password': '...',
      'version_date': '2017-02-27'
    },
    "PersonalityInsightsV3": {
      "username": "...",
      "password": "..."
    },
    "speech_to_text": {
      "url": "https://stream.watsonplatform.net/speech-to-text/api",
      "password": "...",
      "username": "..."
    },
    "text_to_speech": {
      "url": "https://stream.watsonplatform.net/text-to-speech/api",
      "username": "...",
      "password": "..."
    },
    "conversation": {
      username: '...',
      password: '...',
      "version": 'v1',
      "version_date": '2016-07-11'
    },
    "document_conversion": {
      "username": "...",
      "password": "...",
      "version": "v1",
      "version_date": "2015-12-15",
      "config": {
        "word": {
          "heading": {
            "fonts": [
              {
                "level": 1,
                "bold": true,
                "italic": true
              }, {
                "level": 2,
                "bold": true,
                "italic": true
              }, {
                "level": 3,
                "bold": true,
                "italic": true
              }, {
                "level": 4,
                "bold": true,
                "italic": true
              }, {
                "level": 5,
                "bold": true,
                "italic": true
              }, {
                "level": 6,
                "bold": true,
                "italic": true
              }
            ],
            "styles": [
              {
                "level": 1,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }, {
                "level": 2,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }, {
                "level": 3,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }, {
                "level": 4,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }, {
                "level": 5,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }, {
                "level": 6,
                "names": ["pullout heading", "pulloutheading", "heading", "subtitle"]
              }
            ]
          }
        },
        "normalized_html": {
          "exclude_tags_keep_content": ["font", "em", "span", "strong", "code"]
        },
        "answer_units": {
          "selector_tags": [
            "h1",
            "h2",
            "h3",
            "h4",
            "h5",
            "h6"
          ]
        }
      }
    }
  },
  interface_version :['chat-lite','chat-full'],
  password_rules: {
    "min_lowercase_letter": 1,
    "min_uppercase_letter": 1,
    "min_number": 1,
    "min_length": 8,
    "max_special_character": 0
  }
}
