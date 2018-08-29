/*global GeoAnalytics _config AmazonCognitoIdentity AWSCognito*/

let GeoAnalytics = window.GeoAnalytics || {};

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

    GeoAnalytics.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
        window.location.href = 'signin.html'; 
    }; 
   
    if(typeof GeoAnalytics.authToken === 'undefined'){
        GeoAnalytics.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
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
                        const jwtToken = session.getIdToken().getJwtToken()
                        const sessionInfo = jwt_decode(jwtToken)
                        const groups = sessionInfo['cognito:groups']
                        console.log("Groups", groups)
                        if(groups !== undefined && groups.indexOf("admin") >= 0){
                            GeoAnalytics.admin = 'true'
                        } else {
                            GeoAnalytics.admin = 'false'
                        }
                        if(groups !== undefined && groups.indexOf("yorke") >= 0){
                            GeoAnalytics.yorke = 'true'
                        } else {
                            GeoAnalytics.yorke = 'false'
                        }
                        if(groups !== undefined && groups.indexOf("eyre") >= 0){
                            GeoAnalytics.eyre = 'true'
                        } else {
                            GeoAnalytics.eyre = 'false'
                        }
                        console.log("This user is in the admin group", GeoAnalytics.admin)
                        console.log("This user is in the yorke group", GeoAnalytics.yorke)
                        console.log("This user is in the eyre group", GeoAnalytics.eyre)
                        GeoAnalytics.tomo_id = cognitoUser.username 
                        resolve(jwtToken);
                    }
                });
            } else {
                resolve(null);
            }
        });
    } else {
        console.log("Auth token exists")
    }
    
    /*
     * Cognito User Pool functions
     */

    function register(user, onSuccess, onFailure) {
        let attributeList = []

        const dataEmail = {
            Name: 'email',
            Value: user.email
        };
        const dataTomoID = {
            Name: 'custom:tomo_id',
            Value: user.tomo_id
        };
        const dataAdmin = {
            Name: 'custom:admin',
            Value: user.admin
        }

        const attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        const attributeTomoID = new AmazonCognitoIdentity.CognitoUserAttribute(dataTomoID);
        const attributeAdmin = new AmazonCognitoIdentity.CognitoUserAttribute(dataAdmin);

        attributeList.push(attributeEmail)
        attributeList.push(attributeTomoID)
        attributeList.push(attributeAdmin)

        console.log("Attributes", JSON.stringify(attributeList))

        userPool.signUp(user.tomo_id, user.password, attributeList, null,
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
        console.log("User Details", JSON.stringify(cognitoUser))
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure,
            newPasswordRequired: function(userAttributes, requiredAttributes){
                console.log("Verifying new password")
                resetPassword(tomo_id)
            }
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

    function resetPassword(tomo_id){
        let cognitoUser = createCognitoUser(tomo_id)
        console.log("Resetting password for tomo id", tomo_id)
        
        cognitoUser.forgotPassword({
            onSuccess: function(result){
                console.log('result', result)
            },
            onFailure: function(err){
                alert(JSON.stringify(err))
                console.log("Reset password error", JSON.stringify(err))
            },
            inputVerificationCode(){
                const code = prompt('Please input verification code', '')
                console.log('Code', code)
                if(code !== null && code !== ''){
                    let newPassword = ''
                    let confirmPassword = ''
                    bootbox.prompt({
                        title:'Enter new password',
                        inputType: 'password',
                        callback: function(result){
                            newPassword = result
                            bootbox.prompt({
                                title: 'Re-enter new password',
                                inputType: 'password',
                                callback: function(result){
                                    confirmPassword = result
                                    console.log("New password", newPassword)
                                    console.log("Confirm password", confirmPassword)
                                    if(newPassword === confirmPassword){
                                        cognitoUser.confirmPassword(code, newPassword, {
                                            onFailure(err){
                                                console.log(err)
                                            },
                                            onSuccess(){
                                                console.log("Changed password for", tomo_id)
                                            }
                                        });
                                    } else {
                                        alert("Passwords do not match")
                                    } 

                                }
                            })
                        }
                    }) 
                } else {
                    console.log("Cancelled it")
                    window.location.href = 'index.html';

                }  
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
        console.log("Admin status during onDocReady", GeoAnalytics.admin)
        if(GeoAnalytics.admin !== 'true'){
            $('#registerUser').hide()
            $('#adminUser').hide();
        }
      
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
        console.log("Handling password reset")
        event.preventDefault();
        resetPassword(tomo_id);
    }

    function handleRegister(event) {
        let user = {}
        user.email = $('#emailInputRegister').val();
        user.tomo_id = $('#tomoIDInputRegister').val();
        user.password = $('#passwordInputRegister').val();
        password2 = $('#password2InputRegister').val();
        console.log("Checking user admin status", GeoAnalytics.admin)
        user.admin = GeoAnalytics.admin ? $('#password2InputRegister').val() : 'false'

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            console.log('The User ' + JSON.stringify(cognitoUser));
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'signin.html';
            }
        };
        var onFailure = function registerFailure(err) {
            console.log(JSON.stringify(err))
            alert(JSON.stringify(err));
        };
        event.preventDefault();

        if (user.password === password2) {
            register(user, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
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