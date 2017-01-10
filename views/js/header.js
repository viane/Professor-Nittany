/*header.js*/

//use to store global constants

let _dayToMillsec = function(days){ TimeUnit.DAYS.toMillis(days)};     // 1 day to milliseconds.
let _minToMillsec = function(mins){ TimeUnit.MINUTES.toMillis(mins)};
let _hourToMillsec = function(hours){ TimeUnit.HOURS.toMillis(hours)};
let _secToMillsec = function(secs){ TimeUnit.SECONDS.toMillis(secs)};

//event handler for menu bar

//Toggle event for login option sub-menu
$(document).ready(function() {
    if ($(".menu-bar-login")) {
        $(".menu-col1 li .menu-user-btn").click(function() {
            $(".menu-bar-login").toggleClass("open");
        })
    }
})
