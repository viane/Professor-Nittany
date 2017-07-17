'use strict';

var _personalityInsights = require('../watson/personality-insights');

var _personalityInsights2 = _interopRequireDefault(_personalityInsights);

var _array = require('./array');

var _array2 = _interopRequireDefault(_array);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var User = require('../../models/user');
var PersonalityAssessment = require('../../models/personality-assessement');


module.exports.updateUserSelfDescription = function (userID, description) {
  var id = userID;
  return new Promise(function (resolve, reject) {
    var assessment = new PersonalityAssessment();
    assessment.description_content = description;
    assessment.save().then(function (newAssessment) {
      User.update({
        _id: id
      }, {
        $set: {
          personality_evaluation: newAssessment._id
        }
      }).exec().then(function () {
        resolve(newAssessment);
      }).catch(function (err) {
        console.error(err);
        reject(err);
      });
    }).catch(function (err) {
      console.error(err);
      reject(err);
    });
  });
};

module.exports.getAndUpdatePersonalityAssessment = function (assessmentID, description) {
  return new Promise(function (resolve, reject) {
    _personalityInsights2.default.getAnalysis(description).then(function (assessment) {
      return updateUserPersonalityAssessment(assessmentID, assessment).then(resolve()).catch(function (err) {
        console.error(err);
        reject(err);
      });
    }).catch(function (err) {
      console.error(err);
      reject(err);
    });
  });
};

var updateUserPersonalityAssessment = function updateUserPersonalityAssessment(assessmentID, assessment) {
  var id = assessmentID;
  return new Promise(function (resolve, reject) {
    PersonalityAssessment.update({
      _id: id
    }, {
      "$set": {
        'evaluation': assessment
      }
    }).exec().then(function (query_report) {
      resolve(query_report);
    }).catch(function (err) {
      console.error(err);
      reject(err);
    });
  });
};
module.exports.updateUserPersonalityAssessment = updateUserPersonalityAssessment;

module.exports.updateInterest = function (userID, analysis) {
  return new Promise(function (resolve, reject) {
    // each part of analysis is in {text, realvence} json format
    User.findById(userID, function (err, foundUser) {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        // update interest array
        // addup realvence if term exist, else push to array
        analysis.keywords.map(function (keyword) {
          var trueIndex = _array2.default.findIndexByKeyValue(foundUser.interest, 'term', keyword.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += keyword.relevance;
          } else {
            foundUser.interest.unshift({ term: keyword.text, value: keyword.relevance });
          }
        });
        analysis.entities.map(function (entity) {
          var trueIndex = _array2.default.findIndexByKeyValue(foundUser.interest, 'term', entity.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += entity.relevance;
          } else {
            foundUser.interest.unshift({ term: entity.text, value: entity.relevance });
          }
        });
        analysis.concepts.map(function (concept) {
          var trueIndex = _array2.default.findIndexByKeyValue(foundUser.interest, 'term', concept.text);
          if (trueIndex != null) {
            foundUser.interest[trueIndex].value += concept.relevance;
          } else {
            foundUser.interest.unshift({ term: concept.text, value: concept.relevance });
          }
        });

        foundUser.save().then(function (newProfile) {
          resolve(newProfile);
        }).catch(function (err) {
          console.error(err);
          reject(err);
        });
      }
    });
  });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vdXRpbGl0eS9wcm9maWxlLmpzIl0sIm5hbWVzIjpbIlVzZXIiLCJyZXF1aXJlIiwiUGVyc29uYWxpdHlBc3Nlc3NtZW50IiwibW9kdWxlIiwiZXhwb3J0cyIsInVwZGF0ZVVzZXJTZWxmRGVzY3JpcHRpb24iLCJ1c2VySUQiLCJkZXNjcmlwdGlvbiIsImlkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJhc3Nlc3NtZW50IiwiZGVzY3JpcHRpb25fY29udGVudCIsInNhdmUiLCJ0aGVuIiwibmV3QXNzZXNzbWVudCIsInVwZGF0ZSIsIl9pZCIsIiRzZXQiLCJwZXJzb25hbGl0eV9ldmFsdWF0aW9uIiwiZXhlYyIsImNhdGNoIiwiZXJyIiwiY29uc29sZSIsImVycm9yIiwiZ2V0QW5kVXBkYXRlUGVyc29uYWxpdHlBc3Nlc3NtZW50IiwiYXNzZXNzbWVudElEIiwiZ2V0QW5hbHlzaXMiLCJ1cGRhdGVVc2VyUGVyc29uYWxpdHlBc3Nlc3NtZW50IiwicXVlcnlfcmVwb3J0IiwidXBkYXRlSW50ZXJlc3QiLCJhbmFseXNpcyIsImZpbmRCeUlkIiwiZm91bmRVc2VyIiwia2V5d29yZHMiLCJtYXAiLCJrZXl3b3JkIiwidHJ1ZUluZGV4IiwiZmluZEluZGV4QnlLZXlWYWx1ZSIsImludGVyZXN0IiwidGV4dCIsInZhbHVlIiwicmVsZXZhbmNlIiwidW5zaGlmdCIsInRlcm0iLCJlbnRpdGllcyIsImVudGl0eSIsImNvbmNlcHRzIiwiY29uY2VwdCIsIm5ld1Byb2ZpbGUiXSwibWFwcGluZ3MiOiJBQUFBOztBQUdBOzs7O0FBQ0E7Ozs7OztBQUhBLElBQU1BLE9BQU9DLFFBQVEsbUJBQVIsQ0FBYjtBQUNBLElBQU1DLHdCQUF3QkQsUUFBUSxzQ0FBUixDQUE5Qjs7O0FBSUFFLE9BQU9DLE9BQVAsQ0FBZUMseUJBQWYsR0FBMkMsVUFBQ0MsTUFBRCxFQUFTQyxXQUFULEVBQXlCO0FBQ2xFLE1BQU1DLEtBQUtGLE1BQVg7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Q0xULHNCQUFVTSxRQUFWLENBQW1CSSxPQUFuQixDQUEyQixFQUFDQyxNQUFNSSxRQUFRUixJQUFmLEVBQXFCQyxPQUFPTyxRQUFRTixTQUFwQyxFQUEzQjtBQUNEO0FBQ0YsU0FQRDs7QUFTQVQsa0JBQVVwQixJQUFWLEdBQWlCQyxJQUFqQixDQUFzQixVQUFDbUMsVUFBRCxFQUFnQjtBQUNwQ3hDLGtCQUFRd0MsVUFBUjtBQUNELFNBRkQsRUFFRzVCLEtBRkgsQ0FFUyxVQUFDQyxHQUFELEVBQVM7QUFDaEJDLGtCQUFRQyxLQUFSLENBQWNGLEdBQWQ7QUFDQVosaUJBQU9ZLEdBQVA7QUFDRCxTQUxEO0FBTUQ7QUFDRixLQXZDRDtBQXdDRCxHQTFDTSxDQUFQO0FBMkNELENBNUNEIiwiZmlsZSI6InByb2ZpbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG5jb25zdCBVc2VyID0gcmVxdWlyZSgnLi4vLi4vbW9kZWxzL3VzZXInKTtcbmNvbnN0IFBlcnNvbmFsaXR5QXNzZXNzbWVudCA9IHJlcXVpcmUoJy4uLy4uL21vZGVscy9wZXJzb25hbGl0eS1hc3Nlc3NlbWVudCcpO1xuaW1wb3J0IFBlcnNvbmFsaXR5SW5zaWdodHNWMyBmcm9tICcuLi93YXRzb24vcGVyc29uYWxpdHktaW5zaWdodHMnO1xuaW1wb3J0IGFycmF5VXRpbGl0eSBmcm9tICcuL2FycmF5JztcblxubW9kdWxlLmV4cG9ydHMudXBkYXRlVXNlclNlbGZEZXNjcmlwdGlvbiA9ICh1c2VySUQsIGRlc2NyaXB0aW9uKSA9PiB7XG4gIGNvbnN0IGlkID0gdXNlcklEO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGNvbnN0IGFzc2Vzc21lbnQgPSBuZXcgUGVyc29uYWxpdHlBc3Nlc3NtZW50KCk7XG4gICAgYXNzZXNzbWVudC5kZXNjcmlwdGlvbl9jb250ZW50ID0gZGVzY3JpcHRpb247XG4gICAgYXNzZXNzbWVudC5zYXZlKCkudGhlbigobmV3QXNzZXNzbWVudCkgPT4ge1xuICAgICAgVXNlci51cGRhdGUoe1xuICAgICAgICBfaWQ6IGlkXG4gICAgICB9LCB7XG4gICAgICAgICRzZXQ6IHtcbiAgICAgICAgICBwZXJzb25hbGl0eV9ldmFsdWF0aW9uOiBuZXdBc3Nlc3NtZW50Ll9pZFxuICAgICAgICB9XG4gICAgICB9KS5leGVjKCkudGhlbigoKSA9PiB7XG4gICAgICAgIHJlc29sdmUobmV3QXNzZXNzbWVudCk7XG4gICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KVxuXG4gIH0pO1xufVxuXG5tb2R1bGUuZXhwb3J0cy5nZXRBbmRVcGRhdGVQZXJzb25hbGl0eUFzc2Vzc21lbnQgPSAoYXNzZXNzbWVudElELCBkZXNjcmlwdGlvbikgPT4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIFBlcnNvbmFsaXR5SW5zaWdodHNWMy5nZXRBbmFseXNpcyhkZXNjcmlwdGlvbikudGhlbihhc3Nlc3NtZW50ID0+IHVwZGF0ZVVzZXJQZXJzb25hbGl0eUFzc2Vzc21lbnQoYXNzZXNzbWVudElELCBhc3Nlc3NtZW50KS50aGVuKHJlc29sdmUoKSkuY2F0Y2goZXJyID0+IHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH0pKS5jYXRjaChlcnIgPT4ge1xuICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgcmVqZWN0KGVycik7XG4gICAgfSk7XG4gIH0pO1xuXG59XG5cbmNvbnN0IHVwZGF0ZVVzZXJQZXJzb25hbGl0eUFzc2Vzc21lbnQgPSAoYXNzZXNzbWVudElELCBhc3Nlc3NtZW50KSA9PiB7XG4gIGNvbnN0IGlkID0gYXNzZXNzbWVudElEO1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIFBlcnNvbmFsaXR5QXNzZXNzbWVudC51cGRhdGUoe1xuICAgICAgX2lkOiBpZFxuICAgIH0sIHtcbiAgICAgIFwiJHNldFwiOiB7XG4gICAgICAgICdldmFsdWF0aW9uJzogYXNzZXNzbWVudFxuICAgICAgfVxuICAgIH0pLmV4ZWMoKS50aGVuKChxdWVyeV9yZXBvcnQpID0+IHtcbiAgICAgIHJlc29sdmUocXVlcnlfcmVwb3J0KTtcbiAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZWplY3QoZXJyKTtcbiAgICB9KTtcbiAgfSk7XG5cbn1cbm1vZHVsZS5leHBvcnRzLnVwZGF0ZVVzZXJQZXJzb25hbGl0eUFzc2Vzc21lbnQgPSB1cGRhdGVVc2VyUGVyc29uYWxpdHlBc3Nlc3NtZW50O1xuXG5tb2R1bGUuZXhwb3J0cy51cGRhdGVJbnRlcmVzdCA9ICh1c2VySUQsIGFuYWx5c2lzKSA9PiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAvLyBlYWNoIHBhcnQgb2YgYW5hbHlzaXMgaXMgaW4ge3RleHQsIHJlYWx2ZW5jZX0ganNvbiBmb3JtYXRcbiAgICBVc2VyLmZpbmRCeUlkKHVzZXJJRCwgKGVyciwgZm91bmRVc2VyKSA9PiB7XG4gICAgICBpZiAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyB1cGRhdGUgaW50ZXJlc3QgYXJyYXlcbiAgICAgICAgLy8gYWRkdXAgcmVhbHZlbmNlIGlmIHRlcm0gZXhpc3QsIGVsc2UgcHVzaCB0byBhcnJheVxuICAgICAgICBhbmFseXNpcy5rZXl3b3Jkcy5tYXAoKGtleXdvcmQpID0+IHtcbiAgICAgICAgICBjb25zdCB0cnVlSW5kZXggPSBhcnJheVV0aWxpdHkuZmluZEluZGV4QnlLZXlWYWx1ZShmb3VuZFVzZXIuaW50ZXJlc3QsICd0ZXJtJywga2V5d29yZC50ZXh0KTtcbiAgICAgICAgICBpZiAodHJ1ZUluZGV4ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGZvdW5kVXNlci5pbnRlcmVzdFt0cnVlSW5kZXhdLnZhbHVlICs9IGtleXdvcmQucmVsZXZhbmNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVzZXIuaW50ZXJlc3QudW5zaGlmdCh7dGVybToga2V5d29yZC50ZXh0LCB2YWx1ZToga2V5d29yZC5yZWxldmFuY2V9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBhbmFseXNpcy5lbnRpdGllcy5tYXAoKGVudGl0eSkgPT4ge1xuICAgICAgICAgIGNvbnN0IHRydWVJbmRleCA9IGFycmF5VXRpbGl0eS5maW5kSW5kZXhCeUtleVZhbHVlKGZvdW5kVXNlci5pbnRlcmVzdCwgJ3Rlcm0nLCBlbnRpdHkudGV4dCk7XG4gICAgICAgICAgaWYgKHRydWVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3VuZFVzZXIuaW50ZXJlc3RbdHJ1ZUluZGV4XS52YWx1ZSArPSBlbnRpdHkucmVsZXZhbmNlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmb3VuZFVzZXIuaW50ZXJlc3QudW5zaGlmdCh7dGVybTogZW50aXR5LnRleHQsIHZhbHVlOiBlbnRpdHkucmVsZXZhbmNlfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYW5hbHlzaXMuY29uY2VwdHMubWFwKChjb25jZXB0KSA9PiB7XG4gICAgICAgICAgY29uc3QgdHJ1ZUluZGV4ID0gYXJyYXlVdGlsaXR5LmZpbmRJbmRleEJ5S2V5VmFsdWUoZm91bmRVc2VyLmludGVyZXN0LCAndGVybScsIGNvbmNlcHQudGV4dCk7XG4gICAgICAgICAgaWYgKHRydWVJbmRleCAhPSBudWxsKSB7XG4gICAgICAgICAgICBmb3VuZFVzZXIuaW50ZXJlc3RbdHJ1ZUluZGV4XS52YWx1ZSArPSBjb25jZXB0LnJlbGV2YW5jZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZm91bmRVc2VyLmludGVyZXN0LnVuc2hpZnQoe3Rlcm06IGNvbmNlcHQudGV4dCwgdmFsdWU6IGNvbmNlcHQucmVsZXZhbmNlfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBmb3VuZFVzZXIuc2F2ZSgpLnRoZW4oKG5ld1Byb2ZpbGUpID0+IHtcbiAgICAgICAgICByZXNvbHZlKG5ld1Byb2ZpbGUpXG4gICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgcmVqZWN0KGVycilcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59O1xuIl19