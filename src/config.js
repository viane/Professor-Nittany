module.exports = {
  'secretKey': '12345-67890-09876-54321',
  'mongoUrl': 'mongodb://Pb7TdS:qyW3g8LLAqaCELzB@ds033056.mlab.com:33056/intelligent_academic_planner',
  'facebook': {
    clientID: '1962035640700088',
    clientSecret: '26f046e8112ae5048435cf7ef1e6c1ac',
    callbackURL: 'https://localhost:3443/users/facebook/callback'
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
