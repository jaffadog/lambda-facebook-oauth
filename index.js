'use strict';

var OAuth2 = require('oauth').OAuth2;
var https = require('https');

var oauth2 = new OAuth2(
		process.env.appKey,
		process.env.appSecret,
	    "https://graph.facebook.com/", 
	    null, 
	    "v2.8/oauth/access_token");

var options = {
        "redirect_uri" : process.env.redirectUrl
    };

module.exports.auth = (event, context, callback) => {
	
	console.log('event',event);

    /*
	 * return error if query string has an error parameter. e.g. if user
	 * declines to grant access.
	 * error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied
	 */	
	if (event.queryStringParameters && event.queryStringParameters.error) {
		console.log(event.queryStringParameters);
		callback(null, getFailureResponse(event.queryStringParameters));
    }

	// redirect to facebook if "code" is not provided in the query string
	else if (!event.queryStringParameters || !event.queryStringParameters.code) {
		callback(null, {
            statusCode: 302,
            headers: {
            	'Location': 
            		'https://www.facebook.com/v2.5/dialog/oauth'
            		+ '?client_id=' + process.env.appKey
            		+ '&redirect_uri=' + process.env.redirectUrl
            		+ '&scope=email'
            }
		});
	}
	
	// process request from facebook that has "code"
	else {
        oauth2.getOAuthAccessToken(
        	event.queryStringParameters.code,
            options,
            function (error, access_token, refresh_token, results) {
                
                if (error) {
    				console.log(error);
    				callback(null, getFailureResponse(error));
                }
                
                var url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + access_token;
    
                https.get(url, function(res) {
                    console.log("got response: " + res.statusCode);
    
                    var body = '';
    
                    res.on('data', function(chunk) {
                        body += chunk;
                    });
    
                    res.on('end', function() {
                        var json = JSON.parse(body);
                        console.log('id',json.id);
                        console.log('name',json.name);
                        console.log('email',json.email);
                        console.log('url',json.picture.data.url);
                        
                        // you could save/update user details in a DB here...
    
				        console.log('success',data);
						callback(null, getSuccessResponse(data, process.env.appUrl));
                    });
                }).on('error', function (error) {
    				console.log(error);
    				callback(null, getFailureResponse(error));
                });
            }
        );
	}
};

function getSuccessResponse(userId, url) {
	// you could set a session cookie here (e.g. JWT token) and return it to the
	// users browser...
	var response = {
		statusCode : 302,
		headers : {
			'Location' : url,
		}
	};
	return response;
}

function getFailureResponse(error) {
	// this pretty raw... were just going to return a crude error... you could
	// do something pretty here
	var response = {
		statusCode : 400,
		body : JSON.stringify(error),
	};
	return response;
}
