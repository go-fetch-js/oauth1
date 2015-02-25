# go-fetch-oauth1

[![Circle CI](https://circleci.com/gh/go-fetch-js/oauth1.svg?style=svg)](https://circleci.com/gh/go-fetch-js/oauth1)

OAuth v1 authentication.

## Installation

    npm install --save go-fetch go-fetch-oauth1
    
## Usage
    
    var Client      = require('go-fetch');
    var OAuth1      = require('go-fetch-oauth1');
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

## API

### OAuth1(options)

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

### plugin.fetchRequestToken(callback)

    /**
     * Retrieve a request token from the service
     * @param   {function(Error, Object)} callback
     * @returns {plugin}
     */
     
### plugin.fetchAccessToken(verification, callback)
 
    /**
     * Retrieve an access token from the service
     * @param   {string}                  verifier
     * @param   {function(Error, Object)} callback
     * @returns {plugin}
     */
     
### plugin.getToken()

    /**
     * Get the request/access token used by the plugin
     * @returns {Object}
     */
     
### plugin.setToken(token)

    /**
     * Set the request/access token used by the plugin
     * @param   {Object} token
     * @param   {string} token.token
     * @param   {string} token.secret
     * @returns {plugin}
     */
	 
### plugin.getAuthorisationUrl() : string

    /**
     * Get the URL to the service's authorisation page which users should be sent to
     * @returns {string}
     */

 
## ToDo

- Fix checking content-type checks for existing content with HTTP POST/PUTs 
- Finish `authorisation_method` switches

## License

The MIT License (MIT)

Copyright (c) 2014 James Newell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.