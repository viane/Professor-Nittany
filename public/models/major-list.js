// app/models/utility-data.js

'use strict';

var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;

// define the schema for our user model
var MajorSchema = mongoose.Schema({
    "degree_name": {
        type: String
    },
    "degree_level": {
        type: String
    },
    "degree_option": {
        type: String,
        default: null
    },
    "utility_type": {
        type: String,
        default: "degree"
    }

});

// create the model for users and expose it to our app
module.exports = mongoose.model('Major', MajorSchema);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tb2RlbHMvbWFqb3ItbGlzdC5qcyJdLCJuYW1lcyI6WyJtb25nb29zZSIsInJlcXVpcmUiLCJNYWpvclNjaGVtYSIsIlNjaGVtYSIsInR5cGUiLCJTdHJpbmciLCJkZWZhdWx0IiwibW9kdWxlIiwiZXhwb3J0cyIsIm1vZGVsIl0sIm1hcHBpbmdzIjoiQUFBQTs7QUFFQTs7QUFFQSxJQUFNQSxXQUFXQyxRQUFRLFVBQVIsQ0FBakI7QUFDQTs7QUFFQTtBQUNBLElBQU1DLGNBQWNGLFNBQVNHLE1BQVQsQ0FBZ0I7QUFDNUIsbUJBQWM7QUFDVkMsY0FBS0M7QUFESyxLQURjO0FBSTVCLG9CQUFnQjtBQUNaRCxjQUFLQztBQURPLEtBSlk7QUFPNUIscUJBQWdCO0FBQ1pELGNBQUtDLE1BRE87QUFFWkMsaUJBQVM7QUFGRyxLQVBZO0FBVzVCLG9CQUFlO0FBQ1hGLGNBQUtDLE1BRE07QUFFWEMsaUJBQVM7QUFGRTs7QUFYYSxDQUFoQixDQUFwQjs7QUFrQkE7QUFDQUMsT0FBT0MsT0FBUCxHQUFpQlIsU0FBU1MsS0FBVCxDQUFlLE9BQWYsRUFBd0JQLFdBQXhCLENBQWpCIiwiZmlsZSI6Im1ham9yLWxpc3QuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcHAvbW9kZWxzL3V0aWxpdHktZGF0YS5qc1xuXG4ndXNlIHN0cmljdCdcblxuY29uc3QgbW9uZ29vc2UgPSByZXF1aXJlKCdtb25nb29zZScpO1xuLy9tb25nb29zZS5Qcm9taXNlID0gZ2xvYmFsLlByb21pc2U7XG5cbi8vIGRlZmluZSB0aGUgc2NoZW1hIGZvciBvdXIgdXNlciBtb2RlbFxuY29uc3QgTWFqb3JTY2hlbWEgPSBtb25nb29zZS5TY2hlbWEoe1xuICAgICAgICBcImRlZ3JlZV9uYW1lXCI6e1xuICAgICAgICAgICAgdHlwZTpTdHJpbmdcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWdyZWVfbGV2ZWxcIjoge1xuICAgICAgICAgICAgdHlwZTpTdHJpbmdcbiAgICAgICAgfSxcbiAgICAgICAgXCJkZWdyZWVfb3B0aW9uXCI6e1xuICAgICAgICAgICAgdHlwZTpTdHJpbmcsXG4gICAgICAgICAgICBkZWZhdWx0OiBudWxsXG4gICAgICAgIH0sXG4gICAgICAgIFwidXRpbGl0eV90eXBlXCI6e1xuICAgICAgICAgICAgdHlwZTpTdHJpbmcsXG4gICAgICAgICAgICBkZWZhdWx0OiBcImRlZ3JlZVwiXG4gICAgICAgIH1cblxufSk7XG5cbi8vIGNyZWF0ZSB0aGUgbW9kZWwgZm9yIHVzZXJzIGFuZCBleHBvc2UgaXQgdG8gb3VyIGFwcFxubW9kdWxlLmV4cG9ydHMgPSBtb25nb29zZS5tb2RlbCgnTWFqb3InLCBNYWpvclNjaGVtYSk7XG4iXX0=