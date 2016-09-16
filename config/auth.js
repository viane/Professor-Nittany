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
		'clientID' 		: 'your-secret-clientID-here',
		'clientSecret' 	: 'your-client-secret-here',
		'callbackURL' 	: 'https://agent-allen-allenz.c9users.io/auth/google/callback'
	}

};