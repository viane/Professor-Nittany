module.exports = {
  'secretKey': '12345-67890-09876-54321',
  'mongoUrl': 'mongodb://Pb7TdS:qyW3g8LLAqaCELzB@ds033056.mlab.com:33056/intelligent_academic_planner',
  'facebook': {
    clientID: '1962035640700088',
    clientSecret: '26f046e8112ae5048435cf7ef1e6c1ac',
    callbackURL: 'https://localhost:3443/users/facebook/callback'
  },
  'twitter' : {
    'consumerKey'     : 'NEKSGvDlA6Hz63BFaPYfshOEA',
    'consumerSecret'  : 'lxw7wAvKo90IW0zZXi9qKqlKXyyWRxV8gEPgE5ylknIlbV2Y0n',
    'callbackURL'     : 'https://localhost:3443/users/twitter/callback'
  },

  'google' : {
    'clientID'    : '132722948922-gavv9i3p51t0heg27qihaj1c4kocn01h.apps.googleusercontent.com',
    'clientSecret'  : 'ZTKGjktIOUz3-m1L0BCBud_9',
    'callbackURL'   : 'https://localhost:3443/users/google/callback'
  },

  'linkedin' : {
    'clientID'    : '78y1qxhj1ass0f',
    'clientSecret'  : 'gbyTOaNTCXegTufn',
    'callbackURL'   : 'https://localhost:3443/users/linkedin/callback'
  },

  'instagram' : {
    'clientID'    : 'c36ed58b9ea848deb94520f896d5a510',
    'clientSecret'  : 'bb4cf3b16e3a4188aa3a875324e66f74',
    'callbackURL'   : 'https://intelligent-student-advisor.herokuapp.com/auth/instagram/callback'
  },

  'reddit' : {
    'clientID'    : 'yo-BqUiqPXuSXA',
    'clientSecret'  : 'vyY0HbuiunObb4eGT-lEkx4CwyM',
    'callbackURL'   : 'https://intelligent-student-advisor.herokuapp.com/auth/reddit/callback',
    'avatar'    : '/img/reddit-icon.png'
  },

  'amazon' : {
    'clientID'    : 'amzn1.application-oa2-client.d1e9e34ce1d24f3a9b68e05f56e9ea73',
    'clientSecret'  : '75f16bbe34c4f5529a81a0e8df431e8f163ed28ee9b5b2e6083961ad1446cf03',
    'callbackURL'   : 'https://intelligent-student-advisor.herokuapp.com/auth/amazon/callback',
    'avatar'    : '/img/amazon-icon.png'
  },

  'wechatAu': {
    'clientID': 'viane2222',
    'clientSecret': 'fada9ec6fa020548',
    'callbackURL': 'https://intelligent-student-advisor.herokuapp.com/auth/wechat/callback',
    'avatar': '/img/wechat-icon.png'
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
    "PersonalityInsightsV3":{
      "username": "195c01cc-e97e-45d7-b235-fb66066f477c",
      "password": "JH0FuKd5KuPp"
    },
    "speech_to_text": {
        "url": "https://stream.watsonplatform.net/speech-to-text/api",
        "password": "wjtexpGgwOPr",
        "username": "4aff3f32-8f56-4c94-9fe5-24250db70592"
    }
  }

}
