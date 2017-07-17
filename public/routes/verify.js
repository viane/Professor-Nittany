'use strict';

var User = require('../models/user');
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('../config.js');

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600
    });
};

exports.verifyOrdinaryUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyAdminUser = function (req, res, next) {
    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {
        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                var err = new Error('You are not authenticated!');
                err.status = 401;
                return next(err);
            } else {
                // if everything is good, save to request for use in other routes
                if (decoded.admin) {
                    req.decoded = decoded;
                    next();
                } else {
                    var err = new Error('You are not authenticated to perform this operation!');
                    err.status = 401;
                    return next(err);
                }
            }
        });
    } else {
        // if there is no token
        // return an error
        var err = new Error('No token provided!');
        err.status = 403;
        return next(err);
    }
};

exports.verifyPasswordFormat = function (password) {
    var passwordValidRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
    var spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
    if (!passwordValidRegex.test(password) || spcialCharRegex.test(password) || password.length == 0) {
        return false;
    } else {
        return true;
    }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9yb3V0ZXMvdmVyaWZ5LmpzIl0sIm5hbWVzIjpbIlVzZXIiLCJyZXF1aXJlIiwiand0IiwiY29uZmlnIiwiZXhwb3J0cyIsImdldFRva2VuIiwidXNlciIsInNpZ24iLCJzZWNyZXRLZXkiLCJleHBpcmVzSW4iLCJ2ZXJpZnlPcmRpbmFyeVVzZXIiLCJyZXEiLCJyZXMiLCJuZXh0IiwidG9rZW4iLCJib2R5IiwicXVlcnkiLCJoZWFkZXJzIiwidmVyaWZ5IiwiZXJyIiwiZGVjb2RlZCIsIkVycm9yIiwic3RhdHVzIiwidmVyaWZ5QWRtaW5Vc2VyIiwiYWRtaW4iLCJ2ZXJpZnlQYXNzd29yZEZvcm1hdCIsInBhc3N3b3JkIiwicGFzc3dvcmRWYWxpZFJlZ2V4IiwiUmVnRXhwIiwic3BjaWFsQ2hhclJlZ2V4IiwidGVzdCIsImxlbmd0aCJdLCJtYXBwaW5ncyI6IkFBQUE7O0FBQ0EsSUFBSUEsT0FBT0MsUUFBUSxnQkFBUixDQUFYO0FBQ0EsSUFBSUMsTUFBTUQsUUFBUSxjQUFSLENBQVYsQyxDQUFtQztBQUNuQyxJQUFJRSxTQUFTRixRQUFRLGNBQVIsQ0FBYjs7QUFFQUcsUUFBUUMsUUFBUixHQUFtQixVQUFVQyxJQUFWLEVBQWdCO0FBQy9CLFdBQU9KLElBQUlLLElBQUosQ0FBU0QsSUFBVCxFQUFlSCxPQUFPSyxTQUF0QixFQUFpQztBQUNwQ0MsbUJBQVc7QUFEeUIsS0FBakMsQ0FBUDtBQUdILENBSkQ7O0FBTUFMLFFBQVFNLGtCQUFSLEdBQTZCLFVBQVVDLEdBQVYsRUFBZUMsR0FBZixFQUFvQkMsSUFBcEIsRUFBMEI7QUFDbkQ7QUFDQSxRQUFJQyxRQUFRSCxJQUFJSSxJQUFKLENBQVNELEtBQVQsSUFBa0JILElBQUlLLEtBQUosQ0FBVUYsS0FBNUIsSUFBcUNILElBQUlNLE9BQUosQ0FBWSxnQkFBWixDQUFqRDs7QUFFQTtBQUNBLFFBQUlILEtBQUosRUFBVztBQUNQO0FBQ0FaLFlBQUlnQixNQUFKLENBQVdKLEtBQVgsRUFBa0JYLE9BQU9LLFNBQXpCLEVBQW9DLFVBQVVXLEdBQVYsRUFBZUMsT0FBZixFQUF3QjtBQUN4RCxnQkFBSUQsR0FBSixFQUFTO0FBQ0wsb0JBQUlBLE1BQU0sSUFBSUUsS0FBSixDQUFVLDRCQUFWLENBQVY7QUFDQUYsb0JBQUlHLE1BQUosR0FBYSxHQUFiO0FBQ0EsdUJBQU9ULEtBQUtNLEdBQUwsQ0FBUDtBQUNILGFBSkQsTUFJTztBQUNIO0FBQ0FSLG9CQUFJUyxPQUFKLEdBQWNBLE9BQWQ7QUFDQVA7QUFDSDtBQUNKLFNBVkQ7QUFXSCxLQWJELE1BYU87QUFDSDtBQUNBO0FBQ0EsWUFBSU0sTUFBTSxJQUFJRSxLQUFKLENBQVUsb0JBQVYsQ0FBVjtBQUNBRixZQUFJRyxNQUFKLEdBQWEsR0FBYjtBQUNBLGVBQU9ULEtBQUtNLEdBQUwsQ0FBUDtBQUNIO0FBQ0osQ0F6QkQ7O0FBMkJBZixRQUFRbUIsZUFBUixHQUEwQixVQUFVWixHQUFWLEVBQWVDLEdBQWYsRUFBb0JDLElBQXBCLEVBQTBCO0FBQ2hEO0FBQ0EsUUFBSUMsUUFBUUgsSUFBSUksSUFBSixDQUFTRCxLQUFULElBQWtCSCxJQUFJSyxLQUFKLENBQVVGLEtBQTVCLElBQXFDSCxJQUFJTSxPQUFKLENBQVksZ0JBQVosQ0FBakQ7O0FBRUE7QUFDQSxRQUFJSCxLQUFKLEVBQVc7QUFDUDtBQUNBWixZQUFJZ0IsTUFBSixDQUFXSixLQUFYLEVBQWtCWCxPQUFPSyxTQUF6QixFQUFvQyxVQUFVVyxHQUFWLEVBQWVDLE9BQWYsRUFBd0I7QUFDeEQsZ0JBQUlELEdBQUosRUFBUztBQUNMLG9CQUFJQSxNQUFNLElBQUlFLEtBQUosQ0FBVSw0QkFBVixDQUFWO0FBQ0FGLG9CQUFJRyxNQUFKLEdBQWEsR0FBYjtBQUNBLHVCQUFPVCxLQUFLTSxHQUFMLENBQVA7QUFDSCxhQUpELE1BSU87QUFDSDtBQUNBLG9CQUFHQyxRQUFRSSxLQUFYLEVBQWlCO0FBQ2JiLHdCQUFJUyxPQUFKLEdBQWNBLE9BQWQ7QUFDQVA7QUFDSCxpQkFIRCxNQUlJO0FBQ0Esd0JBQUlNLE1BQU0sSUFBSUUsS0FBSixDQUFVLHNEQUFWLENBQVY7QUFDQUYsd0JBQUlHLE1BQUosR0FBYSxHQUFiO0FBQ0EsMkJBQU9ULEtBQUtNLEdBQUwsQ0FBUDtBQUNIO0FBRUo7QUFDSixTQWxCRDtBQW1CSCxLQXJCRCxNQXFCTztBQUNIO0FBQ0E7QUFDQSxZQUFJQSxNQUFNLElBQUlFLEtBQUosQ0FBVSxvQkFBVixDQUFWO0FBQ0FGLFlBQUlHLE1BQUosR0FBYSxHQUFiO0FBQ0EsZUFBT1QsS0FBS00sR0FBTCxDQUFQO0FBQ0g7QUFDSixDQWpDRDs7QUFtQ0FmLFFBQVFxQixvQkFBUixHQUErQixVQUFTQyxRQUFULEVBQWtCO0FBQy9DLFFBQU1DLHFCQUFxQixJQUFJQyxNQUFKLENBQVcsNENBQVgsQ0FBM0I7QUFDQSxRQUFNQyxrQkFBa0IsSUFBSUQsTUFBSixDQUFXLHFCQUFYLENBQXhCO0FBQ0EsUUFBSSxDQUFDRCxtQkFBbUJHLElBQW5CLENBQXdCSixRQUF4QixDQUFELElBQXNDRyxnQkFBZ0JDLElBQWhCLENBQXFCSixRQUFyQixDQUF0QyxJQUF3RUEsU0FBU0ssTUFBVCxJQUFtQixDQUEvRixFQUFrRztBQUNoRyxlQUFPLEtBQVA7QUFDRCxLQUZELE1BRU07QUFDSixlQUFPLElBQVA7QUFDRDtBQUNGLENBUkQiLCJmaWxlIjoidmVyaWZ5LmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xudmFyIFVzZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvdXNlcicpO1xudmFyIGp3dCA9IHJlcXVpcmUoJ2pzb253ZWJ0b2tlbicpOyAvLyB1c2VkIHRvIGNyZWF0ZSwgc2lnbiwgYW5kIHZlcmlmeSB0b2tlbnNcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcuanMnKTtcblxuZXhwb3J0cy5nZXRUb2tlbiA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgcmV0dXJuIGp3dC5zaWduKHVzZXIsIGNvbmZpZy5zZWNyZXRLZXksIHtcbiAgICAgICAgZXhwaXJlc0luOiAzNjAwXG4gICAgfSk7XG59O1xuXG5leHBvcnRzLnZlcmlmeU9yZGluYXJ5VXNlciA9IGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xuICAgIC8vIGNoZWNrIGhlYWRlciBvciB1cmwgcGFyYW1ldGVycyBvciBwb3N0IHBhcmFtZXRlcnMgZm9yIHRva2VuXG4gICAgdmFyIHRva2VuID0gcmVxLmJvZHkudG9rZW4gfHwgcmVxLnF1ZXJ5LnRva2VuIHx8IHJlcS5oZWFkZXJzWyd4LWFjY2Vzcy10b2tlbiddO1xuXG4gICAgLy8gZGVjb2RlIHRva2VuXG4gICAgaWYgKHRva2VuKSB7XG4gICAgICAgIC8vIHZlcmlmaWVzIHNlY3JldCBhbmQgY2hlY2tzIGV4cFxuICAgICAgICBqd3QudmVyaWZ5KHRva2VuLCBjb25maWcuc2VjcmV0S2V5LCBmdW5jdGlvbiAoZXJyLCBkZWNvZGVkKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignWW91IGFyZSBub3QgYXV0aGVudGljYXRlZCEnKTtcbiAgICAgICAgICAgICAgICBlcnIuc3RhdHVzID0gNDAxO1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXh0KGVycik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIGlmIGV2ZXJ5dGhpbmcgaXMgZ29vZCwgc2F2ZSB0byByZXF1ZXN0IGZvciB1c2UgaW4gb3RoZXIgcm91dGVzXG4gICAgICAgICAgICAgICAgcmVxLmRlY29kZWQgPSBkZWNvZGVkO1xuICAgICAgICAgICAgICAgIG5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gaWYgdGhlcmUgaXMgbm8gdG9rZW5cbiAgICAgICAgLy8gcmV0dXJuIGFuIGVycm9yXG4gICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ05vIHRva2VuIHByb3ZpZGVkIScpO1xuICAgICAgICBlcnIuc3RhdHVzID0gNDAzO1xuICAgICAgICByZXR1cm4gbmV4dChlcnIpO1xuICAgIH1cbn07XG5cbmV4cG9ydHMudmVyaWZ5QWRtaW5Vc2VyID0gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XG4gICAgLy8gY2hlY2sgaGVhZGVyIG9yIHVybCBwYXJhbWV0ZXJzIG9yIHBvc3QgcGFyYW1ldGVycyBmb3IgdG9rZW5cbiAgICB2YXIgdG9rZW4gPSByZXEuYm9keS50b2tlbiB8fCByZXEucXVlcnkudG9rZW4gfHwgcmVxLmhlYWRlcnNbJ3gtYWNjZXNzLXRva2VuJ107XG5cbiAgICAvLyBkZWNvZGUgdG9rZW5cbiAgICBpZiAodG9rZW4pIHtcbiAgICAgICAgLy8gdmVyaWZpZXMgc2VjcmV0IGFuZCBjaGVja3MgZXhwXG4gICAgICAgIGp3dC52ZXJpZnkodG9rZW4sIGNvbmZpZy5zZWNyZXRLZXksIGZ1bmN0aW9uIChlcnIsIGRlY29kZWQpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdZb3UgYXJlIG5vdCBhdXRoZW50aWNhdGVkIScpO1xuICAgICAgICAgICAgICAgIGVyci5zdGF0dXMgPSA0MDE7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgZXZlcnl0aGluZyBpcyBnb29kLCBzYXZlIHRvIHJlcXVlc3QgZm9yIHVzZSBpbiBvdGhlciByb3V0ZXNcbiAgICAgICAgICAgICAgICBpZihkZWNvZGVkLmFkbWluKXtcbiAgICAgICAgICAgICAgICAgICAgcmVxLmRlY29kZWQgPSBkZWNvZGVkO1xuICAgICAgICAgICAgICAgICAgICBuZXh0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2V7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnIgPSBuZXcgRXJyb3IoJ1lvdSBhcmUgbm90IGF1dGhlbnRpY2F0ZWQgdG8gcGVyZm9ybSB0aGlzIG9wZXJhdGlvbiEnKTtcbiAgICAgICAgICAgICAgICAgICAgZXJyLnN0YXR1cyA9IDQwMTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIHRoZXJlIGlzIG5vIHRva2VuXG4gICAgICAgIC8vIHJldHVybiBhbiBlcnJvclxuICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdObyB0b2tlbiBwcm92aWRlZCEnKTtcbiAgICAgICAgZXJyLnN0YXR1cyA9IDQwMztcbiAgICAgICAgcmV0dXJuIG5leHQoZXJyKTtcbiAgICB9XG59O1xuXG5leHBvcnRzLnZlcmlmeVBhc3N3b3JkRm9ybWF0ID0gZnVuY3Rpb24ocGFzc3dvcmQpe1xuICBjb25zdCBwYXNzd29yZFZhbGlkUmVnZXggPSBuZXcgUmVnRXhwKFwiKD89LipbYS16XSkoPz0uKltBLVpdKSg/PS4qWzAtOV0pKD89Lns4LH0pXCIpO1xuICBjb25zdCBzcGNpYWxDaGFyUmVnZXggPSBuZXcgUmVnRXhwKFwiKD89LipbIUAjXFwkJVxcXiZcXCpdKVwiKTtcbiAgaWYgKCFwYXNzd29yZFZhbGlkUmVnZXgudGVzdChwYXNzd29yZCkgfHwgc3BjaWFsQ2hhclJlZ2V4LnRlc3QocGFzc3dvcmQpIHx8IHBhc3N3b3JkLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9ZWxzZSB7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cbn07Il19