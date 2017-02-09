# lambda-facebook-oauth

Intended for social login/registration purposes.

Your login button should generate a request to:

    https://www.facebook.com/v2.5/dialog/oauth
        ?client_id=<YOUR_FACEBOOK_APP_ID>
        &redirect_uri=<YOUR_AWS_API_GATEWAY_URL_TO_THIS_FUNCTION>
        &scope=email

