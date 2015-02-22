var Client = require('go-fetch');
var OAuth1 = require('..');
var contentType = require('go-fetch-content-type');
var parseBody = require('go-fetch-parse-body');

var oauth = OAuth1({
	consumer: {
		public: 'key',
		secret: 'secret'
	}//,
	//token: {
	//	public: 'accesskey',
	//	secret: 'accesssecret'
	//}
});

oauth.setAccessToken({
	public: 'accesskey',
	secret: 'accesssecret'
});

Client()
	.use(contentType)
	.use(parseBody())
	.use(oauth)
	.post('http://oauthbin.com/v1/echo?msg=Hello World', function(error, response) {
		if (error) {
			console.log(error)
		} else {
			console.log(response.getStatus(), response.getBody());
		}
	})
;
