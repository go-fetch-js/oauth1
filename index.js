var URL = require('url');
var OAuth = require('oauth-1.0a');
var QS = require('qs');
var body = require('go-fetch-parse-body');

/**
 * Authenticate the request using OAuth
 * @param   {Object}  options
 * @param   {String}  options.consumer_key            The consumer key
 * @param   {String}  options.consumer_secret         The consumer secret
 * @param   {String}  [options.token]                 The access token
 * @param   {String}  [options.token_secret]          The access secret
 * @param   {String}  [options.signature_method]      The signature method - HMAC-SHA1|PLAINTEXT|RSA-SHA1
 * @param   {Boolean} [options.authorisation_method]  The authorisation method - HEADER|BODY|QUERY - HEADER
 * @returns {function(Client)}
 */
module.exports = function(options) {
	options = options || {};

	return function plugin(client) {

		oauth = OAuth({
			consumer: {
				public: options.consumer_key,
				secret: options.consumer_secret,
				callback_url: options.callback_url
			},
			signature_method: options.signature_method
		});

		client.on('before', function(event) {
			var
				token     = {},
				request   = event.request,
				response  = event.response
			;

			//token is optional on some services
			if (options.token && options.token_secret) {
				token.public = options.token;
				token.secret = options.token_secret;
			}

			//generate the signature params
			var data = {};
			if (request.getMethod() !== 'GET' && request.getContentType() === 'application/x-www-form-urlencoded') {
				data = QS.parse(request.getBody());
			}
			var params = oauth.authorize({
				method: request.getMethod(),
				url:    request.getUrl().toString(),
				data:   data
			}, token);

			//decide which auth method to use
			if (typeof(options.authorisation_method) === 'undefined' || options.authorisation_method === 'HEADER') {

				request.setHeader('Authorization', oauth.toHeader(params)['Authorization']);

			} else {

				if (request.getMethod() === 'GET') {

					//replace the query string with the OAuth params
					var url = request.getUrl();
					var parsedUrl = URL.parse(url);
					parsedUrl.search = null;
					parsedUrl.query = params;
					url = URL.format(parsedUrl);

					request.setUrl(url);

				} else {

					//replace the body data with the OAuth params
					request
						.setHeader('Content-Type', 'application/x-www-form-urlencoded')
						.setBody(QS.stringify(params))
					;

				}

			}

		});

	};

	/**
	 * Get the request token
	 * @param   {function(Error, Object)} callback
	 * @returns {plugin}
	 */
	plugin.getRequestToken = function(callback) {
		var req = client.post('/oauth/request_token');

		if (options.callback_url) {
			req.getUrl().getQuery().oauth_callback = options.callback_url;
		}

		client.use(body.urlencoded({once: true}));

		client.send(req, function(error, response) {
			if (error) return callback(error);

			if (response.getStatus() !== 200) {
				return callback(undefined, new Error('Invalid response status'));
			}

			var body = response.getBody();

			callback(undefined, {
				token:        body.oauth_token,
				token_secret: body.oauth_token_secret
			});

		});

		return this;
	};

	/**
	 * Get the authorisation URL
	 * @param   {function(Error, Object)} callback
	 * @returns {plugin}
	 */
	plugin.getAuthorisationUrl = function(callback) {
		this.getRequestToken(function(error, token) {
			if (error) return callback(error);

			var query = {oauth_token: token.token};

			if (options.callback_url) {
				query.callback_url = options.callback_url;
			}

			var url = URL.format({
				pathname: '/oauth/authorize',
				query:    query
			});

			callback(undefined, url);
		});
		return this;
	};

	/**
	 * Get the access token
	 * @param   {Object}                  token     The request token
	 * @param   {function(Error, Object)} callback
	 * @returns {plugin}
	 */
	plugin.getAccessToken = function(token, callback) {
		'/oauth/access_token?oauth_token=&oauth_verifier=';
		var req = client.post('/oauth/access_token');

		req.getUrl().getQuery().oauth_token = token.token;

		if (options.callback_url) {
			req.getUrl().getQuery().oauth_callback = +options.callback_url;
		}

		client.send(req, callback);

	};

};