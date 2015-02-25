var URL = require('url');
var OAuth = require('oauth-1.0a');
var QS = require('qs');
var body = require('go-fetch-parse-body');

/**
 * Authenticate the request using OAuth
 * @param   {Object}  options
 *
 * @param   {Object}  [options.consumer]              The consumer data
 * @param   {string}  [options.consumer.key]          The consumer key
 * @param   {string}  [options.consumer.secret]       The consumer secret
 * @param   {string}  [options.consumer.callback_url] The consumer callback URL
 *
 * @param   {Object}  [options.token]                 The token data
 * @param   {string}  [options.token.token]           The token
 * @param   {string}  [options.token.secret]          The token secret
 *
 * @param   {string}  [options.signature_method]      The signature method - HMAC-SHA1|PLAINTEXT|RSA-SHA1
 * @param   {bool}    [options.authorisation_method]  The authorisation method - HEADER|BODY|QUERY - HEADER
 *
 * @returns {function(Client)}
 */
module.exports = function(options) {
	options                         = options || {};
	options.endpoints               = options.endpoints || {};
	options.endpoints.request_token = options.endpoints.request_token || '/oauth/request_token';
	options.endpoints.authorise     = options.endpoints.authorise || '/oauth/authorize';
	options.endpoints.access_token  = options.endpoints.access_token || '/oauth/access_token';

	var
		_consumer = options.consumer || {},
		_token    = typeof(options.token) === 'object' ? options.token : {}
	;

	var plugin = function(client) {

		oauth = OAuth({
			consumer:         {
				public: _consumer.key,
				secret: _consumer.secret
			},
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
			}, {
				public: _token.token,
				secret: _token.secret
			});

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
		 * Retrieve a request token from the service
		 * @param   {function(Error, Object)} callback
		 * @returns {plugin}
		 */
		plugin.fetchRequestToken = function(callback) {

			//check there isn't already an access token set
			if (_token && _token.token) {
				return callback(new Error('A request/access token is already in use. Please remove the current request/access token before retrieving a request token.'));
			}

			var url = new client.constructor.Url(options.endpoints.request_token);

			if (_consumer.callback_url) {
				url.getQuery().oauth_callback = _consumer.callback_url;
			}

			client.use(body.urlencoded({once: true, types: ['*/*']}));

			client.post(url, function(error, response) {
				if (error) return callback(error);

				if (response.getStatus() !== 200) {
					return callback(new Error('Unable to fetch request token. Received an invalid response: status='+response.getStatus()));
				}

				var body = response.getBody();

				callback(null, {
					token:        body.oauth_token,
					secret:       body.oauth_token_secret
				});

			});

			return this;
		};

		/**
		 * Retrieve an access token from the service
		 * @param   {string}                  verifier
		 * @param   {function(Error, Object)} callback
		 * @returns {plugin}
		 */
		plugin.fetchAccessToken = function(verifier, callback) {

			//check there is already an access token set
			if (!_token || !_token.token) {
				return callback(new Error('No request token found. Please set a request token.'));
			}

			var url = new client.constructor.Url(options.endpoints.access_token);

			client.use(body.urlencoded({once: true, types: ['*/*']}));

			url.getQuery().oauth_verifier  = verifier;

			client.post(url, function(error, response) {
				if (error) return callback(error);

				if (response.getStatus() !== 200) {
					return callback(new Error('Unable to fetch access token. Received an invalid response: status='+response.getStatus()));
				}

				var body = response.getBody();

				callback(null, {
					token:        body.oauth_token,
					secret:       body.oauth_token_secret
				});

			});

			return this;
		};

	};

	/**
	 * Get the request/access token used by the plugin
	 * @returns {Object}
	 */
	plugin.getToken = function() {
		return _token;
	};

	/**
	 * Set the request/access token used by the plugin
	 * @param   {Object} token
	 * @param   {string} token.token
	 * @param   {string} token.secret
	 * @returns {plugin}
	 */
	plugin.setToken = function(token) {
		_token = token;
		return this;
	};

	/**
	 * Get the URL to the service's authorisation page which users should be sent to
	 * @returns {string}
	 */
	plugin.getAuthorisationUrl = function() {

		//check there is already an access token set
		if (!_token || !_token.token) {
			throw new Error('No request token found. Please set a request token.');
		}

		var query = {oauth_token: _token.token};

		if (_consumer.callback_url) {
			query.callback_url = _consumer.callback_url;
		}

		var url = URL.format({
			pathname: options.endpoints.authorise,
			query:    query
		});

		return url;
	};

	return plugin;
};