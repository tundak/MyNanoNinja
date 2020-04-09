// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {
	githubAuth: {
		clientID: 'Iv1.6e207d8c157ec748',
		clientSecret: '0e1cddde4a5146d62aaa6df6223545de08b2e669',
		callbackURL: 'http://nodes.bitcoinblack.net/auth/github/callback',
		passReqToCallback: true
	}

};
