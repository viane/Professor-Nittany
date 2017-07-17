'use strict';

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({ 'username': 'c9d48fc2-7b13-46ef-99cb-a8b819a79963', 'password': 'Eg57mMPqQE5R', 'version_date': '2017-02-27' });

module.exports.getAnalysis = function (inputString) {
    var entityGetLimit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 5;
    var keywordGetLimit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
    var conceptGetLimit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 3;


    var parameters = {
        'language': 'en',
        'text': inputString,
        'features': {
            'entities': {
                'emotion': false,
                'sentiment': false,
                'limit': entityGetLimit
            },
            'keywords': {
                'emotion': false,
                'sentiment': false,
                'limit': keywordGetLimit
            },
            'concepts': {
                'emotion': false,
                'sentiment': false,
                'limit': conceptGetLimit
            }
        }
    };

    return new Promise(function (resolve, reject) {
        natural_language_understanding.analyze(parameters, function (err, response) {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(response);
            }
        });
    });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vd2F0c29uL25hdHVyYWwtbGFuZ3VhZ2UtdW5kZXJzdGFuZGluZy5qcyJdLCJuYW1lcyI6WyJOYXR1cmFsTGFuZ3VhZ2VVbmRlcnN0YW5kaW5nVjEiLCJyZXF1aXJlIiwibmF0dXJhbF9sYW5ndWFnZV91bmRlcnN0YW5kaW5nIiwibW9kdWxlIiwiZXhwb3J0cyIsImdldEFuYWx5c2lzIiwiaW5wdXRTdHJpbmciLCJlbnRpdHlHZXRMaW1pdCIsImtleXdvcmRHZXRMaW1pdCIsImNvbmNlcHRHZXRMaW1pdCIsInBhcmFtZXRlcnMiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImFuYWx5emUiLCJlcnIiLCJyZXNwb25zZSIsImNvbnNvbGUiLCJlcnJvciJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBRUEsSUFBTUEsaUNBQWlDQyxRQUFRLDZEQUFSLENBQXZDO0FBQ0EsSUFBTUMsaUNBQWlDLElBQUlGLDhCQUFKLENBQW1DLEVBQUMsWUFBWSxzQ0FBYixFQUFxRCxZQUFZLGNBQWpFLEVBQWlGLGdCQUFnQixZQUFqRyxFQUFuQyxDQUF2Qzs7QUFFQUcsT0FBT0MsT0FBUCxDQUFlQyxXQUFmLEdBQTZCLFVBQVNDLFdBQVQsRUFBa0Y7QUFBQSxRQUE3REMsY0FBNkQsdUVBQTVDLENBQTRDO0FBQUEsUUFBekNDLGVBQXlDLHVFQUF4QixFQUF3QjtBQUFBLFFBQXBCQyxlQUFvQix1RUFBSCxDQUFHOzs7QUFFM0csUUFBTUMsYUFBYTtBQUNmLG9CQUFZLElBREc7QUFFZixnQkFBUUosV0FGTztBQUdmLG9CQUFZO0FBQ1Isd0JBQVk7QUFDUiwyQkFBVyxLQURIO0FBRVIsNkJBQWEsS0FGTDtBQUdSLHlCQUFTQztBQUhELGFBREo7QUFNUix3QkFBWTtBQUNSLDJCQUFXLEtBREg7QUFFUiw2QkFBYSxLQUZMO0FBR1IseUJBQVNDO0FBSEQsYUFOSjtBQVdSLHdCQUFZO0FBQ1IsMkJBQVcsS0FESDtBQUVSLDZCQUFhLEtBRkw7QUFHUix5QkFBU0M7QUFIRDtBQVhKO0FBSEcsS0FBbkI7O0FBc0JBLFdBQU8sSUFBSUUsT0FBSixDQUFZLFVBQUNDLE9BQUQsRUFBVUMsTUFBVixFQUFxQjtBQUNwQ1gsdUNBQStCWSxPQUEvQixDQUF1Q0osVUFBdkMsRUFBbUQsVUFBU0ssR0FBVCxFQUFjQyxRQUFkLEVBQXdCO0FBQ3ZFLGdCQUFJRCxHQUFKLEVBQVM7QUFDTEUsd0JBQVFDLEtBQVIsQ0FBY0gsR0FBZDtBQUNBRix1QkFBT0UsR0FBUDtBQUNILGFBSEQsTUFHTztBQUNISCx3QkFBUUksUUFBUjtBQUNIO0FBQ0osU0FQRDtBQVFILEtBVE0sQ0FBUDtBQVVILENBbENEIiwiZmlsZSI6Im5hdHVyYWwtbGFuZ3VhZ2UtdW5kZXJzdGFuZGluZy5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0J1xuXG5jb25zdCBOYXR1cmFsTGFuZ3VhZ2VVbmRlcnN0YW5kaW5nVjEgPSByZXF1aXJlKCd3YXRzb24tZGV2ZWxvcGVyLWNsb3VkL25hdHVyYWwtbGFuZ3VhZ2UtdW5kZXJzdGFuZGluZy92MS5qcycpO1xuY29uc3QgbmF0dXJhbF9sYW5ndWFnZV91bmRlcnN0YW5kaW5nID0gbmV3IE5hdHVyYWxMYW5ndWFnZVVuZGVyc3RhbmRpbmdWMSh7J3VzZXJuYW1lJzogJ2M5ZDQ4ZmMyLTdiMTMtNDZlZi05OWNiLWE4YjgxOWE3OTk2MycsICdwYXNzd29yZCc6ICdFZzU3bU1QcVFFNVInLCAndmVyc2lvbl9kYXRlJzogJzIwMTctMDItMjcnfSk7XG5cbm1vZHVsZS5leHBvcnRzLmdldEFuYWx5c2lzID0gZnVuY3Rpb24oaW5wdXRTdHJpbmcsZW50aXR5R2V0TGltaXQgPSA1LCBrZXl3b3JkR2V0TGltaXQ9IDEwLCBjb25jZXB0R2V0TGltaXQ9IDMpIHtcblxuICAgIGNvbnN0IHBhcmFtZXRlcnMgPSB7XG4gICAgICAgICdsYW5ndWFnZSc6ICdlbicsXG4gICAgICAgICd0ZXh0JzogaW5wdXRTdHJpbmcsXG4gICAgICAgICdmZWF0dXJlcyc6IHtcbiAgICAgICAgICAgICdlbnRpdGllcyc6IHtcbiAgICAgICAgICAgICAgICAnZW1vdGlvbic6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdzZW50aW1lbnQnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnbGltaXQnOiBlbnRpdHlHZXRMaW1pdFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICdrZXl3b3Jkcyc6IHtcbiAgICAgICAgICAgICAgICAnZW1vdGlvbic6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdzZW50aW1lbnQnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnbGltaXQnOiBrZXl3b3JkR2V0TGltaXRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAnY29uY2VwdHMnOiB7XG4gICAgICAgICAgICAgICAgJ2Vtb3Rpb24nOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAnc2VudGltZW50JzogZmFsc2UsXG4gICAgICAgICAgICAgICAgJ2xpbWl0JzogY29uY2VwdEdldExpbWl0XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBuYXR1cmFsX2xhbmd1YWdlX3VuZGVyc3RhbmRpbmcuYW5hbHl6ZShwYXJhbWV0ZXJzLCBmdW5jdGlvbihlcnIsIHJlc3BvbnNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3BvbnNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG4iXX0=