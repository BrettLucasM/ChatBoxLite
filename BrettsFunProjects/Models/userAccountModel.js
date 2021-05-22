var UserAccount = function(ID, Bio, Work, Status, Seeking) {
    var UserAccountModel = {ID:ID, Bio: Bio, Work: Work, Status:Status, Seeking:Seeking};
    return UserAccountModel;
}

module.exports.UserAccountModel = UserAccount;
