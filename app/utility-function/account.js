module.exports.validPasswordFormat = function (password) {
  const passwordValidRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
  const spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
  if (!passwordValidRegex.test(password) || spcialCharRegex.test(password) || password.length == 0) {
    return false;
  }else {
    return true;
  }
};
