var Client      = require('go-fetch');
var OAuth1      = require('..');
var prefixUrl   = require('go-fetch-prefix-url');
var contentType = require('go-fetch-content-type');
var parseBody   = require('go-fetch-parse-body');

var oauth = OAuth1({
	consumer: {
		key:    'key',
		secret: 'secret'
	},
	token: {
		token:  'accesskey',
		secret: 'accesssecret'
	}
});

Client()
	.use(prefixUrl('http://oauthbin.com/v1'))
	.use(contentType)
	.use(parseBody())
	.use(oauth)
	.post('/echo?msg=Hello World', function(error, response) {
		if (error) {
			console.log(error)
		} else {
			console.log(response.getStatus(), response.getBody());
		}
	})
;
