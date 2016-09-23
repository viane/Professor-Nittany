// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

// config/auth.js

	'facebookAuth' : {
		'clientID' 		: '1099198873493707', //  App ID
		'clientSecret' 	: '4285a312c1c1eb98aa77e49001d23a61', //  App Secret
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/facebook/callback'
	},

	'twitterAuth' : {
		'consumerKey' 		: 'VvwqvcIY5cyMhCEH80A1lhFwt',
		'consumerSecret' 	: '44LLNw992ygVfjoLzzoqS8alpj81idudQLWJyZRJxXqRO4iJRs',
		'callbackURL' 		: 'https://agent-allen-allenz.c9users.io/auth/twitter/callback'
	},

	'googleAuth' : {
		'clientID' 		: '291186601308-3im5rnno66cnohquivm4sh97taip4rlj.apps.googleusercontent.com',
		'clientSecret' 	: 'k_mV3vd3qLJGaSe4qVzB0rF1',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/google/callback'
	},

	'linkedinAuth' : {
		'clientID' 		: '77pspualk4ip3x',
		'clientSecret' 	: 'ql1xSpb8wtT2Mh6G',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/linkedin/callback'
	},
	
	'instagramAuth' : {
		'clientID' 		: 'c36ed58b9ea848deb94520f896d5a510',
		'clientSecret' 	: 'bb4cf3b16e3a4188aa3a875324e66f74',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/instagram/callback'
	},
	
	'redditAuth' : {
		'clientID' 		: 'yo-BqUiqPXuSXA',
		'clientSecret' 	: 'vyY0HbuiunObb4eGT-lEkx4CwyM',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/reddit/callback',
		'avatar'		: '/img/reddit-icon.png'
	},
	
	'amazonAuth' : {
		'clientID' 		: 'amzn1.application-oa2-client.d1e9e34ce1d24f3a9b68e05f56e9ea73',
		'clientSecret' 	: '75f16bbe34c4f5529a81a0e8df431e8f163ed28ee9b5b2e6083961ad1446cf03',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/amazon/callback',
		'avatar'		: '/img/amazon-icon.png'
	}
};