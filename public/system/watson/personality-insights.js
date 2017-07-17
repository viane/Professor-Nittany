'use strict';

var _config = require('../../config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PersonalityInsightsV3 = require('watson-developer-cloud/personality-insights/v3');


var initPersonalityAPI = function initPersonalityAPI() {
  return new Promise(function (resolve, reject) {
    resolve(new PersonalityInsightsV3({
      username: _config2.default.watson.PersonalityInsightsV3.username,
      password: _config2.default.watson.PersonalityInsightsV3.password,
      version_date: '2016-10-20',
      headers: {
        'X-Watson-Learning-Opt-Out': 'false'
      }
    }));
  });
};

module.exports.getAnalysis = function (input) {
  return new Promise(function (resolve, reject) {
    initPersonalityAPI().then(function (personality_insights) {
      var params = {
        // Get the content items from the JSON file.
        text: input,
        raw_scores: true
      };

      personality_insights.profile(params, function (err, response) {
        if (err) {
          reject(err);
        } else {
          resolve(response);
        }
      });
    }).catch(function (err) {
      throw err;
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vd2F0c29uL3BlcnNvbmFsaXR5LWluc2lnaHRzLmpzIl0sIm5hbWVzIjpbIlBlcnNvbmFsaXR5SW5zaWdodHNWMyIsInJlcXVpcmUiLCJpbml0UGVyc29uYWxpdHlBUEkiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInVzZXJuYW1lIiwid2F0c29uIiwicGFzc3dvcmQiLCJ2ZXJzaW9uX2RhdGUiLCJoZWFkZXJzIiwibW9kdWxlIiwiZXhwb3J0cyIsImdldEFuYWx5c2lzIiwidGhlbiIsInBhcmFtcyIsInRleHQiLCJpbnB1dCIsInJhd19zY29yZXMiLCJwZXJzb25hbGl0eV9pbnNpZ2h0cyIsInByb2ZpbGUiLCJlcnIiLCJyZXNwb25zZSIsImNhdGNoIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFHQTs7Ozs7O0FBREEsSUFBTUEsd0JBQXdCQyxRQUFRLGdEQUFSLENBQTlCOzs7QUFHQSxJQUFNQyxxQkFBcUIsU0FBckJBLGtCQUFxQixHQUFNO0FBQy9CLFNBQU8sSUFBSUMsT0FBSixDQUFZLFVBQVNDLE9BQVQsRUFBa0JDLE1BQWxCLEVBQTBCO0FBQzNDRCxZQUFRLElBQUlKLHFCQUFKLENBQTBCO0FBQ2hDTSxnQkFBVSxpQkFBT0MsTUFBUCxDQUFjUCxxQkFBZCxDQUFvQ00sUUFEZDtBQUVoQ0UsZ0JBQVUsaUJBQU9ELE1BQVAsQ0FBY1AscUJBQWQsQ0FBb0NRLFFBRmQ7QUFHaENDLG9CQUFjLFlBSGtCO0FBSWhDQyxlQUFTO0FBQ1AscUNBQTZCO0FBRHRCO0FBSnVCLEtBQTFCLENBQVI7QUFRRCxHQVRNLENBQVA7QUFVRCxDQVhEOztBQWFBQyxPQUFPQyxPQUFQLENBQWVDLFdBQWYsR0FBNkIsaUJBQVM7QUFDcEMsU0FBTyxJQUFJVixPQUFKLENBQVksVUFBU0MsT0FBVCxFQUFrQkMsTUFBbEIsRUFBMEI7QUFDM0NILHlCQUFxQlksSUFBckIsQ0FBMEIsZ0NBQXdCO0FBQ2hELFVBQU1DLFNBQVM7QUFDYjtBQUNBQyxjQUFNQyxLQUZPO0FBR2JDLG9CQUFZO0FBSEMsT0FBZjs7QUFNQUMsMkJBQXFCQyxPQUFyQixDQUE2QkwsTUFBN0IsRUFBcUMsVUFBQ00sR0FBRCxFQUFNQyxRQUFOLEVBQW1CO0FBQ3RELFlBQUlELEdBQUosRUFBUztBQUNQaEIsaUJBQU9nQixHQUFQO0FBQ0QsU0FGRCxNQUVPO0FBQ0xqQixrQkFBUWtCLFFBQVI7QUFDRDtBQUNGLE9BTkQ7QUFRRCxLQWZELEVBZUdDLEtBZkgsQ0FlUyxlQUFPO0FBQ2QsWUFBTUYsR0FBTjtBQUNELEtBakJEO0FBa0JELEdBbkJNLENBQVA7QUFxQkQsQ0F0QkQiLCJmaWxlIjoicGVyc29uYWxpdHktaW5zaWdodHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCdcblxuY29uc3QgUGVyc29uYWxpdHlJbnNpZ2h0c1YzID0gcmVxdWlyZSgnd2F0c29uLWRldmVsb3Blci1jbG91ZC9wZXJzb25hbGl0eS1pbnNpZ2h0cy92MycpO1xuaW1wb3J0IGNvbmZpZyBmcm9tICcuLi8uLi9jb25maWcnO1xuXG5jb25zdCBpbml0UGVyc29uYWxpdHlBUEkgPSAoKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXNvbHZlKG5ldyBQZXJzb25hbGl0eUluc2lnaHRzVjMoe1xuICAgICAgdXNlcm5hbWU6IGNvbmZpZy53YXRzb24uUGVyc29uYWxpdHlJbnNpZ2h0c1YzLnVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQ6IGNvbmZpZy53YXRzb24uUGVyc29uYWxpdHlJbnNpZ2h0c1YzLnBhc3N3b3JkLFxuICAgICAgdmVyc2lvbl9kYXRlOiAnMjAxNi0xMC0yMCcsXG4gICAgICBoZWFkZXJzOiB7XG4gICAgICAgICdYLVdhdHNvbi1MZWFybmluZy1PcHQtT3V0JzogJ2ZhbHNlJ1xuICAgICAgfVxuICAgIH0pKTtcbiAgfSk7XG59XG5cbm1vZHVsZS5leHBvcnRzLmdldEFuYWx5c2lzID0gaW5wdXQgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaW5pdFBlcnNvbmFsaXR5QVBJKCkudGhlbihwZXJzb25hbGl0eV9pbnNpZ2h0cyA9PiB7XG4gICAgICBjb25zdCBwYXJhbXMgPSB7XG4gICAgICAgIC8vIEdldCB0aGUgY29udGVudCBpdGVtcyBmcm9tIHRoZSBKU09OIGZpbGUuXG4gICAgICAgIHRleHQ6IGlucHV0LFxuICAgICAgICByYXdfc2NvcmVzOiB0cnVlXG4gICAgICB9O1xuXG4gICAgICBwZXJzb25hbGl0eV9pbnNpZ2h0cy5wcm9maWxlKHBhcmFtcywgKGVyciwgcmVzcG9uc2UpID0+IHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc29sdmUocmVzcG9uc2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgIH0pLmNhdGNoKGVyciA9PiB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfSk7XG4gIH0pO1xuXG59O1xuIl19