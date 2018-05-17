/*global StatsAnalytics _config AmazonCognitoIdentity AWSCognito*/

var StatsAnalytics = window.StatsAnalytics || {};

(function scopeWrapper($) {
    const signinUrl = 'signin.html';

    const poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    let userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    
    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    } 

    StatsAnalytics.signOut = function signOut() {
        console.log("Signing out of the app")
        userPool.getCurrentUser().signOut();
        window.location.href = 'signin.html'; 
    };

    StatsAnalytics.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        let cognitoUser = userPool.getCurrentUser();
        console.log("The cognito user", cognitoUser)
        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    console.log("An error is here")
                    reject(err);
                } else if (!session.isValid()) {
                     console.log("Not a valid session")
                    resolve(null);
                } else {
                    console.log("Working OK")
                    StatsAnalytics.tomo_id = cognitoUser.username 
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    /*
     * Cognito User Pool functions
     */

    function register(email, tomo_id, password, onSuccess, onFailure) {
        let attributeList = []

        const dataEmail = {
            Name: 'email',
            Value: email
        };
        const dataTomoID = {
            Name: 'custom:tomo_id',
            Value: tomo_id
        };

        const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        const attributeTomoID = new AmazonCognitoIdentity.CognitoUserAttribute(dataTomoID);
        attributeList.push(attributeEmail)
        attributeList.push(attributeTomoID)

        userPool.signUp(tomo_id, password, attributeList, null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(tomo_id, password, onSuccess, onFailure) {
        const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: tomo_id,
            Password: password
        });
        
        const cognitoUser = createCognitoUser(tomo_id);
        //console.log(JSON.stringify(authenticationDetails))
        console.log("User Details", JSON.stringify(cognitoUser))
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(tomo_id, code, onSuccess, onFailure) {
        console.log("Verifying the user")
        createCognitoUser(tomo_id).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function resetPassword(tomo_id, code, password){
        let cognitoUser = createCognitoUser(tomo_id)
        console.log("The user", JSON.stringify(err))
        
        cognitoUser.forgotPassword({
            onSuccess: function(result){
                console.log('result', result)
            },
            onFailure: function(err){
                alert(JSON.stringify(err))
                console.log("Reset password error", JSON.stringify(err))
            },
            inputVerificationCode(){
                console.log("For tomoid", tomo_id)
                console.log("For code", code)
                console.log("For password", password)
                console.log("Time for input verification")
                cognitoUser.confirmPassword(code, password, this)
            }
        })          
    }

    function createCognitoUser(tomo_id) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: tomo_id,
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#passwordResetForm').submit(handlePasswordReset);
    });

    function handleSignin(event) {
        const tomo_id = $('#tomoIDInputSignin').val();
        const password = $('#passwordInputSignin').val();
        console.log("Tomo ID", tomo_id)
        console.log("Password", password)
        event.preventDefault();
        signin(tomo_id, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = 'index.html';
            },
            function signinError(err) {
                if(err.name === 'PasswordResetRequiredException'){
                    window.location.href = 'password-reset.html'; 
                } else {
                    console.log("Error:", JSON.stringify(err))
                    alert(JSON.stringify(err));
                }
               
            }
        );
    }

    function handlePasswordReset(event) {
        const tomo_id = $('#tomoIDInputReset').val();
        const code = $('#passwordResetCode').val();
        const password1 = $('#passwordResetNew').val();
        const password2 = $('#passwordResetNew').val();
        event.preventDefault();
        resetPassword(tomo_id, code, password);
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var tomo_id = $('#tomoIDInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            console.log('The User ' + JSON.stringify(cognitoUser));
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            console.log(JSON.stringify(err))
            alert(JSON.stringify(err));
        };
        event.preventDefault();

        if (password === password2) {
            register(email, tomo_id, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
       // var email = $('#emailInputVerify').val();
        const tomo_id = $('#tomoIDInputVerify').val();
        const code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(tomo_id, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(JSON.stringify(err));
            }
        );
    }
}(jQuery));