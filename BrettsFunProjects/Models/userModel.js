var signUp = function(userID, password, firstN, lastN, email) {
    var SignUpModel = {userID:userID, password:password, firstN:firstN, lastN:lastN, email:email};
    return SignUpModel;
}

module.exports.SignUpModel = signUp;
