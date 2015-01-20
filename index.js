var URL = require('url');
var OAuth = require('oauth-1.0a');
var QS = require('qs');

/**
 * Authenticate the request using OAuth
 * @param   {Object}  options
 * @param   {String}  options.consumer_key            The consumer key
 * @param   {String}  options.consumer_secret         The consumer secret
 * @param   {String}  [options.token]                 The access token
 * @param   {String}  [options.token_secret]          The access secret
 * @param   {String}  [options.signature_method]      The signature method - HMAC-SHA1|PLAINTEXT|RSA-SHA1
 * @param   {Boolean} [options.authorisation_method]  The authorisation method - HEADER|BODY|QUERY - HEADER
 * @returns {Function}
 */
module.exports = function(options) {
	options = options || {};

	return function(client) {

		client.on('before', function(request, response) {
			var token = {};

			oauth = OAuth({
				consumer: {
					public: options.consumer_key,
					secret: options.consumer_secret
				},
				signature_method: options.signature_method
			});

			//token is optional on some services
			if (options.token && options.token_secret) {
				token.public = options.token;
				token.secret = options.token_secret;
			}

			//generate the signature params
			var data = {};
			if (request.method() !== 'GET' && request.contentType === 'application/x-www-form-urlencoded') {
				data = QS.parse(request.body());
			}
			var params = oauth.authorize({
				method: request.method(),
				url:    request.url(),
				data:   data
			}, token);

			//decide which auth method to use
			if (typeof(options.authorisation_method) === 'undefined' || options.authorisation_method === 'HEADER') {

				request.header('Authorization', oauth.toHeader(params)['Authorization']);

			} else {

				if (request.method() === 'GET') {

					//replace the query string with the OAuth params
					var url = request.url();
					var parsedUrl = URL.parse(url);
					parsedUrl.search = null;
					parsedUrl.query = params;
					url = URL.format(parsedUrl);

					request.url(url);

				} else {

					//replace the body data with the OAuth params
					request
						.header('Content-Type', 'application/x-www-form-urlencoded')
						.body(QS.stringify(params))
					;

				}

			}

		});

	};
};