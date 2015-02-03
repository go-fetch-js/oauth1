# go-fetch-oauth1

OAuth v1 authentication.

## Installation

    npm install --save go-fetch go-fetch-oauth1
    
## Usage

    var Client = require('go-fetch');
    var OAuth1 = require('go-fetch-oauth1');
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

## API

### OAuth1(options)

Apply an OAuth plugin to the client.

 * @param   {Object}  options
 * @param   {String}  options.consumer_key            The consumer key
 * @param   {String}  options.consumer_secret         The consumer secret
 * @param   {String}  [options.token]                 The access token
 * @param   {String}  [options.token_secret]          The access secret
 * @param   {String}  [options.signature_method]      The signature method - HMAC-SHA1|PLAINTEXT|RSA-SHA1
 * @param   {Boolean} [options.authorisation_method]  The authorisation method - HEADER|BODY|QUERY - HEADER
 
## ToDo

- Tests
- Fix checking content-type checks for existing content with HTTP POST/PUTs 
- Finish `authorisation_method` switches

## License

The MIT License (MIT)

Copyright (c) 2014 James Newell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.