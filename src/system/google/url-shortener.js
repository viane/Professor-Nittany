const rp = require('request-promise');
module.exports.shortUrl = (givenUrl) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    uri: 'https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyABc0i-xyDogUopnEPT5Z0uBvPoercM8IQ',
    body: {
      "longUrl": givenUrl
    },
    json: true // Automatically stringifies the body to JSON
  }

  return new Promise((resolve, reject) => {
    rp(options)
      .then((res) => {
        const url = res.id;
        resolve(url);
      })
      .catch((err) => {
        console.error(err);
        reject(err);
      });
  });
};
