'use strict';
/////////////////////////////////////////////////////////////////////////////
// Use for format alchemyAPI result in system.js update domain terms func
/////////////////////////////////////////////////////////////////////////////

module.exports.retrieveTermsFromAlchemyAPI = function (_result, _opt) {
    var termArray = [];

    if (!_opt) {
        // default threshold for each categorie terms to be considered add into knowledge domain
        _opt = {
            "threshold": {
                "concept": 0.4,
                "entity": 0.8,
                "taxonomy": 0.3,
                "keyword": 0.5
            }
        };
    }

    _result.concepts.map(function (concept) {
        if (concept.relevance >= _opt.threshold.concept) {
            termArray.unshift(concept.text.trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    });

    _result.entities.map(function (entity) {
        if (entity.relevance >= _opt.threshold.entity) {
            termArray.unshift(entity.text.trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    });

    _result.taxonomy.map(function (taxonomy) {
        if (taxonomy.score >= _opt.threshold.taxonomy) {
            termArray.unshift(taxonomy.label.split("/").pop().trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    });

    _result.keywords.map(function (keyword) {
        if (keyword.relevance >= _opt.threshold.keyword) {
            termArray.unshift(keyword.text.replace("no-title.", "").trim().toLowerCase().replace(new RegExp("\"", "g"), ""));
        }
    });

    return termArray;
};

/////////////////////////////////////////////////////////////////////////////
// Preprocessing key function in process-question.js
/////////////////////////////////////////////////////////////////////////////

// this function is the core algorithm for preprocessing, which should be updated and optimized mostly
module.exports.convertPerspectsToAIReadable = function (perspect_type, content) {
    var AI_Read_String = "";

    // reference Doc/markdown/alchemyAPI response example.md for example output of each perspect

    switch (perspect_type) {
        case "concept":
            content.map(function (perspect) {
                // concept.relevance is between 0 ~ 1
                // scale it to 10
                var weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (var i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "keyword":
            content.map(function (perspect) {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                var weight = Math.round(perspect.relevance * 10);

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (var i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "entity":
            content.map(function (perspect) {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                var weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                for (var i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(perspect.text.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;

        case "taxonomy":
            content.map(function (perspect) {

                // concept.relevance is between 0 ~ 1
                // scale it to 10
                var weight = perspect.count;

                // multiple this concept to the weight ( make this concept repeat wright times)

                var wordSplitBySplash = perspect.label.split("/");
                var taxonomy = wordSplitBySplash.pop();

                for (var i = 0; i < weight; i++) {
                    AI_Read_String = AI_Read_String.concat(taxonomy.replace(new RegExp("\"", "g"), "") + " ");
                }
            });
            break;
    }

    return AI_Read_String;
};

/////////////////////////////////////////////////////////////////////////////
// Format user interest for wordClound2.js
/////////////////////////////////////////////////////////////////////////////
module.exports.convertUserInterestTowordCloud = function (interest) {
    // [{term, value},...] to [[term, (int)value],...]
    return interest.map(function (interest) {
        return [interest.term, parseInt(interest.value, 10) + 1];
    });
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9zeXN0ZW0vdXRpbGl0eS9mb3JtYXR0ZXIuanMiXSwibmFtZXMiOlsibW9kdWxlIiwiZXhwb3J0cyIsInJldHJpZXZlVGVybXNGcm9tQWxjaGVteUFQSSIsIl9yZXN1bHQiLCJfb3B0IiwidGVybUFycmF5IiwiY29uY2VwdHMiLCJtYXAiLCJjb25jZXB0IiwicmVsZXZhbmNlIiwidGhyZXNob2xkIiwidW5zaGlmdCIsInRleHQiLCJ0cmltIiwidG9Mb3dlckNhc2UiLCJyZXBsYWNlIiwiUmVnRXhwIiwiZW50aXRpZXMiLCJlbnRpdHkiLCJ0YXhvbm9teSIsInNjb3JlIiwibGFiZWwiLCJzcGxpdCIsInBvcCIsImtleXdvcmRzIiwia2V5d29yZCIsImNvbnZlcnRQZXJzcGVjdHNUb0FJUmVhZGFibGUiLCJwZXJzcGVjdF90eXBlIiwiY29udGVudCIsIkFJX1JlYWRfU3RyaW5nIiwicGVyc3BlY3QiLCJ3ZWlnaHQiLCJNYXRoIiwicm91bmQiLCJpIiwiY29uY2F0IiwiY291bnQiLCJ3b3JkU3BsaXRCeVNwbGFzaCIsImNvbnZlcnRVc2VySW50ZXJlc3RUb3dvcmRDbG91ZCIsImludGVyZXN0IiwidGVybSIsInBhcnNlSW50IiwidmFsdWUiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBOztBQUVBQSxPQUFPQyxPQUFQLENBQWVDLDJCQUFmLEdBQTZDLFVBQUNDLE9BQUQsRUFBVUMsSUFBVixFQUFtQjtBQUM1RCxRQUFJQyxZQUFZLEVBQWhCOztBQUVBLFFBQUksQ0FBQ0QsSUFBTCxFQUFXO0FBQ1A7QUFDQUEsZUFBTztBQUNILHlCQUFhO0FBQ1QsMkJBQVcsR0FERjtBQUVULDBCQUFVLEdBRkQ7QUFHVCw0QkFBWSxHQUhIO0FBSVQsMkJBQVc7QUFKRjtBQURWLFNBQVA7QUFRSDs7QUFFREQsWUFBUUcsUUFBUixDQUFpQkMsR0FBakIsQ0FBcUIsVUFBQ0MsT0FBRCxFQUFhO0FBQzlCLFlBQUlBLFFBQVFDLFNBQVIsSUFBcUJM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OztBQXdFQTtBQUNBO0FBQ0E7QUFDQTdCLE9BQU9DLE9BQVAsQ0FBZXFDLDhCQUFmLEdBQWdELFVBQVVDLFFBQVYsRUFBb0I7QUFDbEU7QUFDQSxXQUFPQSxTQUFTaEMsR0FBVCxDQUFhLFVBQUNnQyxRQUFELEVBQVk7QUFDOUIsZUFBTyxDQUFDQSxTQUFTQyxJQUFWLEVBQWdCQyxTQUFTRixTQUFTRyxLQUFsQixFQUF3QixFQUF4QixJQUE0QixDQUE1QyxDQUFQO0FBQ0QsS0FGTSxDQUFQO0FBR0QsQ0FMRCIsImZpbGUiOiJmb3JtYXR0ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gVXNlIGZvciBmb3JtYXQgYWxjaGVteUFQSSByZXN1bHQgaW4gc3lzdGVtLmpzIHVwZGF0ZSBkb21haW4gdGVybXMgZnVuY1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxubW9kdWxlLmV4cG9ydHMucmV0cmlldmVUZXJtc0Zyb21BbGNoZW15QVBJID0gKF9yZXN1bHQsIF9vcHQpID0+IHtcbiAgICBsZXQgdGVybUFycmF5ID0gW107XG5cbiAgICBpZiAoIV9vcHQpIHtcbiAgICAgICAgLy8gZGVmYXVsdCB0aHJlc2hvbGQgZm9yIGVhY2ggY2F0ZWdvcmllIHRlcm1zIHRvIGJlIGNvbnNpZGVyZWQgYWRkIGludG8ga25vd2xlZGdlIGRvbWFpblxuICAgICAgICBfb3B0ID0ge1xuICAgICAgICAgICAgXCJ0aHJlc2hvbGRcIjoge1xuICAgICAgICAgICAgICAgIFwiY29uY2VwdFwiOiAwLjQsXG4gICAgICAgICAgICAgICAgXCJlbnRpdHlcIjogMC44LFxuICAgICAgICAgICAgICAgIFwidGF4b25vbXlcIjogMC4zLFxuICAgICAgICAgICAgICAgIFwia2V5d29yZFwiOiAwLjVcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9yZXN1bHQuY29uY2VwdHMubWFwKChjb25jZXB0KSA9PiB7XG4gICAgICAgIGlmIChjb25jZXB0LnJlbGV2YW5jZSA+PSBfb3B0LnRocmVzaG9sZC5jb25jZXB0KSB7XG4gICAgICAgICAgICB0ZXJtQXJyYXkudW5zaGlmdChjb25jZXB0LnRleHQudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcIlwiLCBcImdcIiksIFwiXCIpKTtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBfcmVzdWx0LmVudGl0aWVzLm1hcCgoZW50aXR5KSA9PiB7XG4gICAgICAgIGlmIChlbnRpdHkucmVsZXZhbmNlID49IF9vcHQudGhyZXNob2xkLmVudGl0eSkge1xuICAgICAgICAgICAgdGVybUFycmF5LnVuc2hpZnQoZW50aXR5LnRleHQudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcIlwiLCBcImdcIiksIFwiXCIpKTtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBfcmVzdWx0LnRheG9ub215Lm1hcCgodGF4b25vbXkpID0+IHtcbiAgICAgICAgaWYgKHRheG9ub215LnNjb3JlID49IF9vcHQudGhyZXNob2xkLnRheG9ub215KSB7XG4gICAgICAgICAgICB0ZXJtQXJyYXkudW5zaGlmdCh0YXhvbm9teS5sYWJlbC5zcGxpdChcIi9cIikucG9wKCkudHJpbSgpLnRvTG93ZXJDYXNlKCkucmVwbGFjZShuZXcgUmVnRXhwKFwiXFxcIlwiLCBcImdcIiksIFwiXCIpKTtcbiAgICAgICAgfVxuICAgIH0pXG5cbiAgICBfcmVzdWx0LmtleXdvcmRzLm1hcCgoa2V5d29yZCkgPT4ge1xuICAgICAgICBpZiAoa2V5d29yZC5yZWxldmFuY2UgPj0gX29wdC50aHJlc2hvbGQua2V5d29yZCkge1xuICAgICAgICAgICAgdGVybUFycmF5LnVuc2hpZnQoa2V5d29yZC50ZXh0LnJlcGxhY2UoXCJuby10aXRsZS5cIixcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFwiXCIsIFwiZ1wiKSwgXCJcIikpO1xuICAgICAgICB9XG4gICAgfSlcblxuICAgIHJldHVybiB0ZXJtQXJyYXk7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBQcmVwcm9jZXNzaW5nIGtleSBmdW5jdGlvbiBpbiBwcm9jZXNzLXF1ZXN0aW9uLmpzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG4vLyB0aGlzIGZ1bmN0aW9uIGlzIHRoZSBjb3JlIGFsZ29yaXRobSBmb3IgcHJlcHJvY2Vzc2luZywgd2hpY2ggc2hvdWxkIGJlIHVwZGF0ZWQgYW5kIG9wdGltaXplZCBtb3N0bHlcbm1vZHVsZS5leHBvcnRzLmNvbnZlcnRQZXJzcGVjdHNUb0FJUmVhZGFibGUgPSAocGVyc3BlY3RfdHlwZSwgY29udGVudCkgPT4ge1xuICAgIGxldCBBSV9SZWFkX1N0cmluZyA9IFwiXCI7XG5cbiAgICAvLyByZWZlcmVuY2UgRG9jL21hcmtkb3duL2FsY2hlbXlBUEkgcmVzcG9uc2UgZXhhbXBsZS5tZCBmb3IgZXhhbXBsZSBvdXRwdXQgb2YgZWFjaCBwZXJzcGVjdFxuXG4gICAgc3dpdGNoIChwZXJzcGVjdF90eXBlKSB7XG4gICAgICAgIGNhc2UgXCJjb25jZXB0XCI6XG4gICAgICAgICAgICBjb250ZW50Lm1hcCgocGVyc3BlY3QpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBjb25jZXB0LnJlbGV2YW5jZSBpcyBiZXR3ZWVuIDAgfiAxXG4gICAgICAgICAgICAgICAgLy8gc2NhbGUgaXQgdG8gMTBcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHQgPSBNYXRoLnJvdW5kKHBlcnNwZWN0LnJlbGV2YW5jZSAqIDEwKTtcblxuICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIHRoaXMgY29uY2VwdCB0byB0aGUgd2VpZ2h0ICggbWFrZSB0aGlzIGNvbmNlcHQgcmVwZWF0IHdyaWdodCB0aW1lcylcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2VpZ2h0OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgQUlfUmVhZF9TdHJpbmcgPSBBSV9SZWFkX1N0cmluZy5jb25jYXQocGVyc3BlY3QudGV4dC5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFwiXCIsIFwiZ1wiKSwgXCJcIikgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwia2V5d29yZFwiOlxuICAgICAgICAgICAgY29udGVudC5tYXAoKHBlcnNwZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25jZXB0LnJlbGV2YW5jZSBpcyBiZXR3ZWVuIDAgfiAxXG4gICAgICAgICAgICAgICAgLy8gc2NhbGUgaXQgdG8gMTBcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHQgPSBNYXRoLnJvdW5kKHBlcnNwZWN0LnJlbGV2YW5jZSAqIDEwKTtcblxuICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIHRoaXMgY29uY2VwdCB0byB0aGUgd2VpZ2h0ICggbWFrZSB0aGlzIGNvbmNlcHQgcmVwZWF0IHdyaWdodCB0aW1lcylcblxuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgd2VpZ2h0OyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgQUlfUmVhZF9TdHJpbmcgPSBBSV9SZWFkX1N0cmluZy5jb25jYXQocGVyc3BlY3QudGV4dC5yZXBsYWNlKG5ldyBSZWdFeHAoXCJcXFwiXCIsIFwiZ1wiKSwgXCJcIikgKyBcIiBcIik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcblxuICAgICAgICBjYXNlIFwiZW50aXR5XCI6XG4gICAgICAgICAgICBjb250ZW50Lm1hcCgocGVyc3BlY3QpID0+IHtcblxuICAgICAgICAgICAgICAgIC8vIGNvbmNlcHQucmVsZXZhbmNlIGlzIGJldHdlZW4gMCB+IDFcbiAgICAgICAgICAgICAgICAvLyBzY2FsZSBpdCB0byAxMFxuICAgICAgICAgICAgICAgIGNvbnN0IHdlaWdodCA9IHBlcnNwZWN0LmNvdW50O1xuXG4gICAgICAgICAgICAgICAgLy8gbXVsdGlwbGUgdGhpcyBjb25jZXB0IHRvIHRoZSB3ZWlnaHQgKCBtYWtlIHRoaXMgY29uY2VwdCByZXBlYXQgd3JpZ2h0IHRpbWVzKVxuXG4gICAgICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB3ZWlnaHQ7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICBBSV9SZWFkX1N0cmluZyA9IEFJX1JlYWRfU3RyaW5nLmNvbmNhdChwZXJzcGVjdC50ZXh0LnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXCJcIiwgXCJnXCIpLCBcIlwiKSArIFwiIFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuXG4gICAgICAgIGNhc2UgXCJ0YXhvbm9teVwiOlxuICAgICAgICAgICAgY29udGVudC5tYXAoKHBlcnNwZWN0KSA9PiB7XG5cbiAgICAgICAgICAgICAgICAvLyBjb25jZXB0LnJlbGV2YW5jZSBpcyBiZXR3ZWVuIDAgfiAxXG4gICAgICAgICAgICAgICAgLy8gc2NhbGUgaXQgdG8gMTBcbiAgICAgICAgICAgICAgICBjb25zdCB3ZWlnaHQgPSBwZXJzcGVjdC5jb3VudDtcblxuICAgICAgICAgICAgICAgIC8vIG11bHRpcGxlIHRoaXMgY29uY2VwdCB0byB0aGUgd2VpZ2h0ICggbWFrZSB0aGlzIGNvbmNlcHQgcmVwZWF0IHdyaWdodCB0aW1lcylcblxuICAgICAgICAgICAgICAgIGNvbnN0IHdvcmRTcGxpdEJ5U3BsYXNoID0gcGVyc3BlY3QubGFiZWwuc3BsaXQoXCIvXCIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHRheG9ub215ID0gd29yZFNwbGl0QnlTcGxhc2gucG9wKCk7XG5cbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHdlaWdodDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIEFJX1JlYWRfU3RyaW5nID0gQUlfUmVhZF9TdHJpbmcuY29uY2F0KHRheG9ub215LnJlcGxhY2UobmV3IFJlZ0V4cChcIlxcXCJcIiwgXCJnXCIpLCBcIlwiKSArIFwiIFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cblxuICAgIHJldHVybiBBSV9SZWFkX1N0cmluZztcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEZvcm1hdCB1c2VyIGludGVyZXN0IGZvciB3b3JkQ2xvdW5kMi5qc1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbm1vZHVsZS5leHBvcnRzLmNvbnZlcnRVc2VySW50ZXJlc3RUb3dvcmRDbG91ZCA9IGZ1bmN0aW9uIChpbnRlcmVzdCkge1xuICAvLyBbe3Rlcm0sIHZhbHVlfSwuLi5dIHRvIFtbdGVybSwgKGludCl2YWx1ZV0sLi4uXVxuICByZXR1cm4gaW50ZXJlc3QubWFwKChpbnRlcmVzdCk9PntcbiAgICByZXR1cm4gW2ludGVyZXN0LnRlcm0sIHBhcnNlSW50KGludGVyZXN0LnZhbHVlLDEwKSsxXTtcbiAgfSlcbn07XG4iXX0=