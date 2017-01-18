module.exports.doNothing = function (input) {
  return new Promise(function(resolve, reject){
    resolve(input);
  })
};
