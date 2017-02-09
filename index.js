var OAuth2 = require('oauth').OAuth2;
var https = require('https');

var oauth2 = new OAuth2(
		"<YOUR_FACEBOOK_APP_ID>", 
		"<YOUR_FACEBOOK_APP_SECRET>", 
		"https://graph.facebook.com/", 
		null, 
		"v2.8/oauth/access_token");

exports.handler = function(event, context) {

	// if user declines to grant access
	// error=access_denied&error_code=200&error_description=Permissions+error&error_reason=user_denied
	if (event.error) {
		console.log(event.error);
		return context.fail(event.error);
	}

	// you need to authorize this in you fb app config
	var options = {
		"redirect_uri" : "<YOUR_AWS_API_GATEWAY_URL_TO_THIS_FUNCTION>"
	};

	oauth2.getOAuthAccessToken(event.code, options, function(error, access_token, refresh_token, results) {

		if (error) {
			console.log(error);
			return context.fail(error);
		}

		console.log('access_token = ', access_token);

		// assumes you've requested email in your scope
		var url = "https://graph.facebook.com/me?fields=id,name,email,picture&access_token=" + access_token;

		https.get(url, function(res) {
			console.log("Got response: " + res.statusCode);

			var body = '';

			res.on('data', function(chunk) {
				body += chunk;
			});

			res.on('end', function() {
				console.log(body);

				body2 = JSON.parse(body);
				console.log('id', body2.id);
				console.log('name', body2.name);
				console.log('email', body2.email);
				console.log('url', body2.picture.data.url);

				// FIXME: the above coud be used to register/create/update account

				context.succeed(body);
			});

		}).on('error', function(e) {
			console.log("Got error: ", e);
			context.done(null, 'FAILURE');
		});

	});
};
