var assert = require('assert');

var Client      = require('go-fetch');
var prefixUrl   = require('go-fetch-prefix-url');
var contentType = require('go-fetch-content-type');
var parseBody   = require('go-fetch-parse-body');
var OAuth1      = require('..');

var oauth, client;

/**
 * Testing against http://oauthbin.com
 */
describe('OAuth', function() {

	beforeEach(function() {

		oauth = OAuth1({
			consumer: {
				key:    'key',
				secret: 'secret'
			},
			endpoints: {
				request_token:  '/request-token',
				access_token:   '/access-token'
			}
		});

		client = Client()
			.use(prefixUrl('http://oauthbin.com/v1'))
			.use(contentType)
			.use(oauth)
		;

	});

	describe('.fetchRequestToken()', function() {

		it('should match the expected values', function(done) {
			oauth.fetchRequestToken(function(error, token) {
				assert(!error);
				assert.equal(token.token, 'requestkey');
				assert.equal(token.secret, 'requestsecret');
				done();
			});
		});

	});

	describe('.fetchAccessToken()', function() {

		it('should match the expected values', function(done) {

			oauth.setToken({
				token: 'requestkey',
				secret: 'requestsecret'
			});

			oauth.fetchAccessToken('', function(error, token) {
				assert(!error);
				assert.equal(token.token, 'accesskey');
				assert.equal(token.secret, 'accesssecret');
				done();
			});

		});

	});

	describe('.post()', function() {

		it('should match the expected values', function(done) {

			oauth.setToken({
				token: 'accesskey',
				secret: 'accesssecret'
			});

			client.use(parseBody.urlencoded({once: true, types: ['*/*']}));
			client.post('http://oauthbin.com/v1/echo?msg=Hello World', function(error, response) {
				assert(!error);
				assert.equal(response.getStatus(), 200);
				assert.deepEqual(response.getBody(), {msg: 'Hello World'});
				done();
			});

		});

	});

});