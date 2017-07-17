'use strict';

var _array = require('../system/utility/array');

var _array2 = _interopRequireDefault(_array);

var _string = require('../system/utility/string');

var _string2 = _interopRequireDefault(_string);

var _profile = require('../system/utility/profile');

var _profile2 = _interopRequireDefault(_profile);

var _naturalLanguageUnderstanding = require('../system/watson/natural-language-understanding');

var _naturalLanguageUnderstanding2 = _interopRequireDefault(_naturalLanguageUnderstanding);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var profileRouter = express.Router();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Verify = require('./verify');
var User = require('../models/user');

var PersonalityAssessment = require('../models/personality-assessement');


profileRouter.use(bodyParser.json());

// API GET /profile/interest-manual
profileRouter.get('/interest-manual', Verify.verifyOrdinaryUser, function (req, res) {
  User.findById(req.decoded._id).exec().then(function (updateRecord, err) {
    res.status(200).json({
      interest: [updateRecord.interest_manual]
    });
  }).catch(function (err) {
    console.error(err);
    res.status(302).json(err);
  });
});

// API POST /profile/interest-manual {"interest_manual":["CS","CE"]}
profileRouter.post('/interest-manual', Verify.verifyOrdinaryUser, function (req, res) {
  User.findById(req.decoded._id).exec().then(function (updateRecord, err) {
    if (err) {
      console.error(err);
      res.status(302).json(err);
    } else {
      // manual add current user max weight from AI recognized interest to the interest that user input by hand
      var maxScore = 1.0;
      for (var i = 0; i < updateRecord.interest.length; i++) {
        if (maxScore < updateRecord.interest[i].value) {
          maxScore = updateRecord.interest[i].value;
        }
      }
      // form manual interest array has no duplicates with max weight
      var interestAry = _array2.default.arrayUnique(req.body.interest_manual.map(function (interest) {
        if (interest.length < 2) {
          return res.status(200).json({ error: "Minimal interest length is 2" });
        };
        return { 'term': interest.toString().trim(), value: maxScore };
      }));
      updateRecord.interest_manual = interestAry;
      updateRecord.save(function (err, user) {
        if (err) {
          console.error(err);
          return res.status(302).json(err);
        }
        res.status(200).json({ message: "Done updating" });
      });
    }
  }).catch(function (err) {
    console.error(err);
    res.status(302).json(err);
  });
});

// API POST /profile/update-introduction
profileRouter.post('/update-introduction', Verify.verifyOrdinaryUser, function (req, res) {
  var introdcution = req.body.introdcution;
  _profile2.default.updateUserSelfDescription(req.decoded._id, introdcution).then(function (newAssessment) {
    // if user description is longer than 100 words, update persoanlity assessment and analysis
    if (_string2.default.countWords(introdcution) > 100) {
      // update assessment and analysis
      _profile2.default.getAndUpdatePersonalityAssessment(newAssessment._id, introdcution).then(function () {
        // update interest
        _naturalLanguageUnderstanding2.default.getAnalysis(introdcution).then(function (analysis) {
          _profile2.default.updateInterest(req.decoded._id, analysis).then(function (newProfile) {
            res.status(200).json({ message: "Done", "update-profile": newProfile });
          }).catch(function (err) {
            console.error(err);
            res.status(302).json(err);
          });
        }).catch(function (err) {
          console.error(err);
          res.status(200).json({ message: "Done with warning", "warning": err });
        });
      }).catch(function (err) {
        console.error(err);
        res.status(200).json({ message: "Done with warning", "warning": err });
      });
    } else {
      // if less than 100 words, only update user description content to DB
      var assessment = new PersonalityAssessment();
      assessment.description_content = introdcution;
      assessment.save().then(function (newAssessment) {
        User.update({
          _id: req.decoded._id
        }, {
          $set: {
            'personality_evaluation': newAssessment._id
          }
        }).exec().then(function () {
          // update interest
          _naturalLanguageUnderstanding2.default.getAnalysis(introdcution, 20, 20, 20).then(function (analysis) {
            _profile2.default.updateInterest(req.decoded._id, analysis).then(function (newProfile) {
              res.status(200).json({ "update-profile": newProfile });
            }).catch(function (err) {
              console.error(err);
              res.status(302).json(err);
            });
          }).catch(function (err) {
            console.error(err);
            res.status(302).json(err);
          });
        }).catch(function (err) {
          console.error(err);
          res.status(302).json(err);
        });
      });
    }
  }).catch(function (err) {
    console.error(err);
    res.status(302).json(err);
  });
});

module.exports = profileRouter;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvcHJvZmlsZS5qcyJdLCJuYW1lcyI6WyJleHByZXNzIiwicmVxdWlyZSIsInByb2ZpbGVSb3V0ZXIiLCJSb3V0ZXIiLCJib2R5UGFyc2VyIiwibW9uZ29vc2UiLCJWZXJpZnkiLCJVc2VyIiwiUGVyc29uYWxpdHlBc3Nlc3NtZW50IiwidXNlIiwianNvbiIsImdldCIsInZlcmlmeU9yZGluYXJ5VXNlciIsInJlcSIsInJlcyIsImZpbmRCeUlkIiwiZGVjb2RlZCIsIl9pZCIsImV4ZWMiLCJ0aGVuIiwidXBkYXRlUmVjb3JkIiwiZXJyIiwic3RhdHVzIiwiaW50ZXJlc3QiLCJpbnRlcmVzdF9tYW51YWwiLCJjYXRjaCIsImNvbnNvbGUiLCJlcnJvciIsInBvc3QiLCJtYXhTY29yZSIsImkiLCJsZW5ndGgiLCJ2YWx1ZSIsImludGVyZXN0QXJ5IiwiYXJyYXlVbmlxdWUiLCJib2R5IiwibWFwIiwidG9TdHJpbmciLCJ0cmltIiwic2F2ZSIsInVzZXIiLCJtZXNzYWdlIiwiaW50cm9kY3V0aW9uIiwidXBkYXRlVXNlclNlbGZEZXNjcmlwdGlvbiIsIm5ld0Fzc2Vzc21lbnQiLCJjb3VudFdvcmRzIiwiZ2V0QW5kVXBkYXRlUGVyc29uYWxpdHlBc3Nlc3NtZW50IiwiZ2V0QW5hbHlzaXMiLCJhbmFseXNpcyIsInVwZGF0ZUludGVyZXN0IiwibmV3UHJvZmlsZSIsImFzc2Vzc21lbnQiLCJkZXNjcmlwdGlvbl9jb250ZW50IiwidXBkYXRlIiwiJHNldCIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiI7O0FBTUE7Ozs7QUFDQTs7OztBQUVBOzs7O0FBQ0E7Ozs7OztBQVZBLElBQU1BLFVBQVVDLFFBQVEsU0FBUixDQUFoQjtBQUNBLElBQU1DLGdCQUFnQkYsUUFBUUcsTUFBUixFQUF0QjtBQUNBLElBQU1DLGFBQWFILFFBQVEsYUFBUixDQUFuQjtBQUNBLElBQU1JLFdBQVdKLFFBQVEsVUFBUixDQUFqQjtBQUNBLElBQU1L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RkQsRUFFR3pCLEtBRkgsQ0FFUyxVQUFDSixHQUFELEVBQVM7QUFDaEJLLHNCQUFRQyxLQUFSLENBQWNOLEdBQWQ7QUFDQVAsa0JBQUlRLE1BQUosQ0FBVyxHQUFYLEVBQWdCWixJQUFoQixDQUFxQlcsR0FBckI7QUFDRCxhQUxEO0FBTUQsV0FQRCxFQU9HSSxLQVBILENBT1MsVUFBQ0osR0FBRCxFQUFTO0FBQ2hCSyxvQkFBUUMsS0FBUixDQUFjTixHQUFkO0FBQ0FQLGdCQUFJUSxNQUFKLENBQVcsR0FBWCxFQUFnQlosSUFBaEIsQ0FBcUJXLEdBQXJCO0FBQ0QsV0FWRDtBQVdELFNBbkJELEVBbUJHSSxLQW5CSCxDQW1CUyxVQUFDSixHQUFELEVBQVM7QUFDaEJLLGtCQUFRQyxLQUFSLENBQWNOLEdBQWQ7QUFDQVAsY0FBSVEsTUFBSixDQUFXLEdBQVgsRUFBZ0JaLElBQWhCLENBQXFCVyxHQUFyQjtBQUNELFNBdEJEO0FBdUJELE9BeEJEO0FBeUJEO0FBQ0YsR0FuREQsRUFtREdJLEtBbkRILENBbURTLFVBQVNKLEdBQVQsRUFBYztBQUNyQkssWUFBUUMsS0FBUixDQUFjTixHQUFkO0FBQ0FQLFFBQUlRLE1BQUosQ0FBVyxHQUFYLEVBQWdCWixJQUFoQixDQUFxQlcsR0FBckI7QUFDRCxHQXRERDtBQXVERCxDQXpERDs7QUEyREFrQyxPQUFPQyxPQUFQLEdBQWlCdEQsYUFBakIiLCJmaWxlIjoicHJvZmlsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGV4cHJlc3MgPSByZXF1aXJlKCdleHByZXNzJyk7XG5jb25zdCBwcm9maWxlUm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcbmNvbnN0IGJvZHlQYXJzZXIgPSByZXF1aXJlKCdib2R5LXBhcnNlcicpO1xuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuY29uc3QgVmVyaWZ5ID0gcmVxdWlyZSgnLi92ZXJpZnknKTtcbmNvbnN0IFVzZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvdXNlcicpO1xuaW1wb3J0IGFycmF5VXRpbGl0eSBmcm9tICcuLi9zeXN0ZW0vdXRpbGl0eS9hcnJheSc7XG5pbXBvcnQgc3RyaW5nIGZyb20gJy4uL3N5c3RlbS91dGlsaXR5L3N0cmluZyc7XG5jb25zdCBQZXJzb25hbGl0eUFzc2Vzc21lbnQgPSByZXF1aXJlKCcuLi9tb2RlbHMvcGVyc29uYWxpdHktYXNzZXNzZW1lbnQnKTtcbmltcG9ydCBwcm9maWxlVXRpbGl0eSBmcm9tICcuLi9zeXN0ZW0vdXRpbGl0eS9wcm9maWxlJztcbmltcG9ydCBuYXR1cmFsTGFuZ3VhZ2VVbmRlcnN0YW5kaW5nIGZyb20gJy4uL3N5c3RlbS93YXRzb24vbmF0dXJhbC1sYW5ndWFnZS11bmRlcnN0YW5kaW5nJztcblxucHJvZmlsZVJvdXRlci51c2UoYm9keVBhcnNlci5qc29uKCkpO1xuXG4vLyBBUEkgR0VUIC9wcm9maWxlL2ludGVyZXN0LW1hbnVhbFxucHJvZmlsZVJvdXRlci5nZXQoJy9pbnRlcmVzdC1tYW51YWwnLCBWZXJpZnkudmVyaWZ5T3JkaW5hcnlVc2VyLCAocmVxLCByZXMpID0+IHtcbiAgVXNlci5maW5kQnlJZChyZXEuZGVjb2RlZC5faWQpLmV4ZWMoKS50aGVuKCh1cGRhdGVSZWNvcmQsIGVycikgPT4ge1xuICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtcbiAgICAgIGludGVyZXN0OiBbdXBkYXRlUmVjb3JkLmludGVyZXN0X21hbnVhbF1cbiAgICB9KTtcbiAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpO1xuICB9KTtcbn0pO1xuXG4vLyBBUEkgUE9TVCAvcHJvZmlsZS9pbnRlcmVzdC1tYW51YWwge1wiaW50ZXJlc3RfbWFudWFsXCI6W1wiQ1NcIixcIkNFXCJdfVxucHJvZmlsZVJvdXRlci5wb3N0KCcvaW50ZXJlc3QtbWFudWFsJywgVmVyaWZ5LnZlcmlmeU9yZGluYXJ5VXNlciwgKHJlcSwgcmVzKSA9PiB7XG4gIFVzZXIuZmluZEJ5SWQocmVxLmRlY29kZWQuX2lkKS5leGVjKCkudGhlbigodXBkYXRlUmVjb3JkLCBlcnIpID0+IHtcbiAgICBpZiAoZXJyKSB7XG4gICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtYW51YWwgYWRkIGN1cnJlbnQgdXNlciBtYXggd2VpZ2h0IGZyb20gQUkgcmVjb2duaXplZCBpbnRlcmVzdCB0byB0aGUgaW50ZXJlc3QgdGhhdCB1c2VyIGlucHV0IGJ5IGhhbmRcbiAgICAgIGxldCBtYXhTY29yZSA9IDEuMDtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdXBkYXRlUmVjb3JkLmludGVyZXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChtYXhTY29yZSA8IHVwZGF0ZVJlY29yZC5pbnRlcmVzdFtpXS52YWx1ZSkge1xuICAgICAgICAgIG1heFNjb3JlID0gdXBkYXRlUmVjb3JkLmludGVyZXN0W2ldLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBmb3JtIG1hbnVhbCBpbnRlcmVzdCBhcnJheSBoYXMgbm8gZHVwbGljYXRlcyB3aXRoIG1heCB3ZWlnaHRcbiAgICAgIGNvbnN0IGludGVyZXN0QXJ5ID0gYXJyYXlVdGlsaXR5LmFycmF5VW5pcXVlKHJlcS5ib2R5LmludGVyZXN0X21hbnVhbC5tYXAoKGludGVyZXN0KSA9PiB7XG4gICAgICAgIGlmIChpbnRlcmVzdC5sZW5ndGggPCAyKSB7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMjAwKS5qc29uKHtlcnJvcjogXCJNaW5pbWFsIGludGVyZXN0IGxlbmd0aCBpcyAyXCJ9KTtcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHsndGVybSc6IGludGVyZXN0LnRvU3RyaW5nKCkudHJpbSgpLCB2YWx1ZTogbWF4U2NvcmV9XG4gICAgICB9KSk7XG4gICAgICB1cGRhdGVSZWNvcmQuaW50ZXJlc3RfbWFudWFsID0gaW50ZXJlc3RBcnk7XG4gICAgICB1cGRhdGVSZWNvcmQuc2F2ZSgoZXJyLCB1c2VyKSA9PiB7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoMzAyKS5qc29uKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgcmVzLnN0YXR1cygyMDApLmpzb24oe21lc3NhZ2U6IFwiRG9uZSB1cGRhdGluZ1wifSk7XG4gICAgICB9KVxuICAgIH1cbiAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpO1xuICB9KTtcbn0pO1xuXG4vLyBBUEkgUE9TVCAvcHJvZmlsZS91cGRhdGUtaW50cm9kdWN0aW9uXG5wcm9maWxlUm91dGVyLnBvc3QoJy91cGRhdGUtaW50cm9kdWN0aW9uJywgVmVyaWZ5LnZlcmlmeU9yZGluYXJ5VXNlciwgKHJlcSwgcmVzKSA9PiB7XG4gIGNvbnN0IGludHJvZGN1dGlvbiA9IHJlcS5ib2R5LmludHJvZGN1dGlvbjtcbiAgcHJvZmlsZVV0aWxpdHkudXBkYXRlVXNlclNlbGZEZXNjcmlwdGlvbihyZXEuZGVjb2RlZC5faWQsIGludHJvZGN1dGlvbikudGhlbigobmV3QXNzZXNzbWVudCkgPT4ge1xuICAgIC8vIGlmIHVzZXIgZGVzY3JpcHRpb24gaXMgbG9uZ2VyIHRoYW4gMTAwIHdvcmRzLCB1cGRhdGUgcGVyc29hbmxpdHkgYXNzZXNzbWVudCBhbmQgYW5hbHlzaXNcbiAgICBpZiAoc3RyaW5nLmNvdW50V29yZHMoaW50cm9kY3V0aW9uKSA+IDEwMCkge1xuICAgICAgLy8gdXBkYXRlIGFzc2Vzc21lbnQgYW5kIGFuYWx5c2lzXG4gICAgICBwcm9maWxlVXRpbGl0eS5nZXRBbmRVcGRhdGVQZXJzb25hbGl0eUFzc2Vzc21lbnQobmV3QXNzZXNzbWVudC5faWQsIGludHJvZGN1dGlvbikudGhlbigoKSA9PiB7XG4gICAgICAgIC8vIHVwZGF0ZSBpbnRlcmVzdFxuICAgICAgICBuYXR1cmFsTGFuZ3VhZ2VVbmRlcnN0YW5kaW5nLmdldEFuYWx5c2lzKGludHJvZGN1dGlvbikudGhlbigoYW5hbHlzaXMpID0+IHtcbiAgICAgICAgICBwcm9maWxlVXRpbGl0eS51cGRhdGVJbnRlcmVzdChyZXEuZGVjb2RlZC5faWQsIGFuYWx5c2lzKS50aGVuKChuZXdQcm9maWxlKSA9PiB7XG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7bWVzc2FnZTpcIkRvbmVcIixcInVwZGF0ZS1wcm9maWxlXCI6IG5ld1Byb2ZpbGV9KVxuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMzAyKS5qc29uKGVycilcbiAgICAgICAgICB9KVxuICAgICAgICB9KS5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKS5qc29uKHttZXNzYWdlOlwiRG9uZSB3aXRoIHdhcm5pbmdcIixcIndhcm5pbmdcIjplcnJ9KVxuICAgICAgICB9KTtcbiAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7bWVzc2FnZTpcIkRvbmUgd2l0aCB3YXJuaW5nXCIsXCJ3YXJuaW5nXCI6ZXJyfSlcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiBsZXNzIHRoYW4gMTAwIHdvcmRzLCBvbmx5IHVwZGF0ZSB1c2VyIGRlc2NyaXB0aW9uIGNvbnRlbnQgdG8gREJcbiAgICAgIGNvbnN0IGFzc2Vzc21lbnQgPSBuZXcgUGVyc29uYWxpdHlBc3Nlc3NtZW50KCk7XG4gICAgICBhc3Nlc3NtZW50LmRlc2NyaXB0aW9uX2NvbnRlbnQgPSBpbnRyb2RjdXRpb247XG4gICAgICBhc3Nlc3NtZW50LnNhdmUoKS50aGVuKChuZXdBc3Nlc3NtZW50KSA9PiB7XG4gICAgICAgIFVzZXIudXBkYXRlKHtcbiAgICAgICAgICBfaWQ6IHJlcS5kZWNvZGVkLl9pZFxuICAgICAgICB9LCB7XG4gICAgICAgICAgJHNldDoge1xuICAgICAgICAgICAgJ3BlcnNvbmFsaXR5X2V2YWx1YXRpb24nOiBuZXdBc3Nlc3NtZW50Ll9pZFxuICAgICAgICAgIH1cbiAgICAgICAgfSkuZXhlYygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIC8vIHVwZGF0ZSBpbnRlcmVzdFxuICAgICAgICAgIG5hdHVyYWxMYW5ndWFnZVVuZGVyc3RhbmRpbmcuZ2V0QW5hbHlzaXMoaW50cm9kY3V0aW9uLCAyMCwgMjAsIDIwKS50aGVuKChhbmFseXNpcykgPT4ge1xuICAgICAgICAgICAgcHJvZmlsZVV0aWxpdHkudXBkYXRlSW50ZXJlc3QocmVxLmRlY29kZWQuX2lkLCBhbmFseXNpcykudGhlbigobmV3UHJvZmlsZSkgPT4ge1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCkuanNvbih7XCJ1cGRhdGUtcHJvZmlsZVwiOiBuZXdQcm9maWxlfSlcbiAgICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pLmNhdGNoKChlcnIpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMzAyKS5qc29uKGVycilcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goKGVycikgPT4ge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICAgICAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgIGNvbnNvbGUuZXJyb3IoZXJyKTtcbiAgICByZXMuc3RhdHVzKDMwMikuanNvbihlcnIpXG4gIH0pXG59KVxuXG5tb2R1bGUuZXhwb3J0cyA9IHByb2ZpbGVSb3V0ZXI7XG4iXX0=