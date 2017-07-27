module.exports = {
  'questionThreshold':'0.2',
  'server_url': {
    'public': 'https://5eee40c0.ngrok.io',
    'local': 'localhost:3000/'
  },
  'secretKey': '12345-67890-09876-54321',
  'secret': '94838472',
  'mongoUrl': 'mongodb://Pb7TdS:qyW3g8LLAqaCELzB@ds033056.mlab.com:33056/intelligent_academic_planner',
  'facebook': {
    clientID: '1962035640700088',
    clientSecret: '26f046e8112ae5048435cf7ef1e6c1ac',
    callbackURL: 'https://localhost:3443/users/facebook/callback'
  },
  'twitter': {
    'consumerKey': '3LMDaxawNk2L71KDz0qFfyovW',
    'consumerSecret': 'K4ifsbzDPS3lh0sLBPF5vh43lSmnYM0EcJtLBB5Emji0iGcAz4',
    'callbackURL': 'https://127.0.0.1:3443/users/twitter/callback'
  },

  'google': {
    'clientID': '132722948922-gavv9i3p51t0heg27qihaj1c4kocn01h.apps.googleusercontent.com',
    'clientSecret': 'ZTKGjktIOUz3-m1L0BCBud_9',
    'callbackURL': 'https://localhost:3443/users/google/callback'
  },

  'linkedin': {
    'clientID': '78y1qxhj1ass0f',
    'clientSecret': 'gbyTOaNTCXegTufn',
    'callbackURL': 'https://localhost:3443/users/linkedin/callback'
  },

  'instagram': {
    'clientID': 'c36ed58b9ea848deb94520f896d5a510',
    'clientSecret': 'bb4cf3b16e3a4188aa3a875324e66f74',
    'callbackURL': 'https://intelligent-student-advisor.herokuapp.com/auth/instagram/callback'
  },

  'reddit': {
    'clientID': 'yo-BqUiqPXuSXA',
    'clientSecret': 'vyY0HbuiunObb4eGT-lEkx4CwyM',
    'callbackURL': 'https://intelligent-student-advisor.herokuapp.com/auth/reddit/callback',
    'avatar': '/img/reddit-icon.png'
  },

  'amazon': {
    'clientID': 'amzn1.application-oa2-client.d1e9e34ce1d24f3a9b68e05f56e9ea73',
    'clientSecret': '75f16bbe34c4f5529a81a0e8df431e8f163ed28ee9b5b2e6083961ad1446cf03',
    'callbackURL': 'https://intelligent-student-advisor.herokuapp.com/auth/amazon/callback',
    'avatar': '/img/amazon-icon.png'
  },

  'wechatAu': {
    'clientID': 'viane2222',
    'clientSecret': 'fada9ec6fa020548',
    'callbackURL': 'https://intelligent-student-advisor.herokuapp.com/auth/wechat/callback',
    'avatar': '/img/wechat-icon.png'
  },
  'twilio': {
    "accountSid": "AC986df3d5c5b5185f845ac46499758075",
    "authToken": "8953462aa58c2dfaf97835ef40b26fc5"
  },
  'watson': {
    retrieve_and_rank: {
      username: 'a658754c-09f3-4cc4-a8a1-198a25cd295e',
      password: 'KTldeBICAwNp',
      version: 'v1'
    },
    "rrparams": {
      cluster_id: 'scd1a4815e_895b_4a51_b8da_239255267abd',
      collection_name: 'Intelligent-Academic-Planner-Collection'
    },
    "ranker_id": '1eec74x28-rank-4480',
    "NaturalLanguageUnderstanding": {
      'username': 'c9d48fc2-7b13-46ef-99cb-a8b819a79963',
      'password': 'Eg57mMPqQE5R',
      'version_date': '2017-02-27'
    },
    "PersonalityInsightsV3": {
      "username": "195c01cc-e97e-45d7-b235-fb66066f477c",
      "password": "JH0FuKd5KuPp"
    },
    "speech_to_text": {
      "url": "https://stream.watsonplatform.net/speech-to-text/api",
      "password": "wjtexpGgwOPr",
      "username": "4aff3f32-8f56-4c94-9fe5-24250db70592"
    },
    "text_to_speech": {
      "url": "https://stream.watsonplatform.net/text-to-speech/api",
      "username": "8e6365d0-31a1-472c-b486-13a1b67fc4e0",
      "password": "kp733VHdahQH"
    },
    "conversation": {
      "username": '2b2e38a3-e4b9-4602-a9eb-8be58f235fca',
      "password": 'YXyHpjWJXbLf',
      "version": 'v1',
      "version_date": '2016-07-11'
    },
    "document_conversion": {
      "username": "d1f406ed-2958-472b-80d6-f1f5a8f176f1",
      "password": "hiJHDXkxq16o",
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
  }

}
