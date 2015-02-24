var URL = require('url');
var OAuth = require('oauth-1.0a');
var QS = require('qs');
var body = require('go-fetch-parse-body');

/**
 * Authenticate the request using OAuth
 * @param   {Object}  options
 *
 * @param   {Object}  [options.consumer]              The consumer data
 * @param   {string}  [options.consumer.public]       The public consumer value
 * @param   {string}  [options.consumer.secret]       The secret consumer value
 * @param   {string}  [options.consumer.callback_url] The consumer callback URL
 *
 * @param   {Object}  [options.token]                 The access token
 * @param   {string}  [options.token.public]          The public access token value
 * @param   {string}  [options.token.secret]          The secret access token value
 *
 * @param   {string}  [options.signature_method]      The signature method - HMAC-SHA1|PLAINTEXT|RSA-SHA1
 * @param   {bool}    [options.authorisation_method]  The authorisation method - HEADER|BODY|QUERY - HEADER
 *
 * @param   {string}  options.consumer_key            The consumer key - deprecated
 * @param   {string}  options.consumer_secret         The consumer secret - deprecated
 * @param   {string}  options.callback_url            The consumer callback URL - deprecated
 *
 * @param   {string}  [options.token]                 The access token - deprecated
 * @param   {string}  [options.token_secret]          The access secret - deprecated
 *
 * @returns {function(Client)}
 */
module.exports = function(options) {
	options = options || {};

	var
		consumer      = options.consumer || {},
		access_token  = typeof(options.token) === 'object' ? options.token : {}
	;

	//support deprecated properties temporarily
	if (options.consumer_key) {
		consumer.public = options.consumer_key;
	}
	if (options.consumer_secret) {
		consumer.secret = options.consumer_secret;
	}
	if (options.callback_url) {
		consumer.callback_url = options.callback_url;
	}
	if (typeof(options.token) === 'string') {
		access_token.public = options.token;
	}
	if (options.token_secret) {
		access_token.secret = options.token_secret;
	}

	var plugin = function(client) {

		oauth = OAuth({
			consumer:         consumer,
			signature_method: options.signature_method
		});

		client.on('before', function(event) {
			var
				request   = event.request,
				response  = event.response
			;

			//generate the signature params
			var data = {};
			if (request.getMethod() !== 'GET' && request.isContentType('urlencoded')) {
				data = QS.parse(request.getBody());
			}
			var params = oauth.authorize({
				method: request.getMethod(),
				url:    request.getUrl().toString(),
				data:   data
			}, access_token);

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

		/**
		 * Get the request token
		 * @param   {function(Error, Object)} callback
		 * @returns {plugin}
		 */
		plugin.getRequestToken = function(callback) {
			var req = client.post('/oauth/request_token');

			if (consumer.callback_url) {
				req.getUrl().getQuery().oauth_callback = consumer.callback_url;
			}

			client.use(body.urlencoded({once: true, types: ['*/*']}));

			client.send(req, function(error, response) {
				if (error) return callback(error);

				if (response.getStatus() !== 200) {
					return callback(new Error('Invalid response '+response.getStatus()));
				}

				var body = response.getBody();

				callback(undefined, {
					public:       body.oauth_token,
					secret:       body.oauth_token_secret,
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

				var query = {oauth_token: token.public || token.token};

				if (consumer.callback_url) {
					query.callback_url = consumer.callback_url;
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
		 * Get a new access token from the server
		 * @param   {Object}                  token           The request token
		 * @param   {string}                  token.public    The request token public key
		 * @param   {string}                  token.verifier
		 * @param   {function(Error, Object)} callback
		 * @returns {plugin}
		 */
		plugin.getAccessToken = function(token, callback) {
			var req = client.post('/oauth/access_token');

			client.use(body.urlencoded({once: true, types: ['*/*']}));

			var url = req.getUrl();
			url.getQuery().oauth_token     = token.public || token.token;
			url.getQuery().oauth_verifier  = token.verifier;

			if (consumer.callback_url) {
				url.getQuery().oauth_callback = +consumer.callback_url;
			}

			client.send(req, function(error, response) {
				if (error) return callback(error);

				if (response.getStatus() !== 200) {
					return callback(new Error('Invalid response '+response.getStatus()));
				}

				var body = response.getBody();

				callback(undefined, {
					public:       body.oauth_token,
					secret:       body.oauth_token_secret,
					token:        body.oauth_token,
					token_secret: body.oauth_token_secret
				});

			});

			return this;
		};

	};

	/**
	 * Set the access token used by the plugin
	 * @param   {Object} token
	 * @returns {plugin}
	 */
	plugin.setAccessToken = function(token) {
		access_token = token;
		return this;
	};

	return plugin;
};