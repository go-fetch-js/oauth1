var Client = require('go-fetch');
var OAuth1 = require('..');
var contentType = require('go-fetch-content-type');
var parseBody = require('go-fetch-parse-body');

Client()
	.use(contentType)
	.use(parseBody())
	.use(OAuth1({
		consumer_key:     'key',
		consumer_secret:  'secret',
		token:            'accesskey',
		token_secret:     'accesssecret'
	}))
	.post('http://oauthbin.com/v1/echo?msg=Hello World', function(error, response) {
		if (error) {
			console.log(error)
		} else {
			console.log(response.getStatus(), response.getBody());
		}
	})
;
