/*global $*/
//event handler for menu bar

//Toggle event for login option sub-menu
$(document).ready(function() {
    if ($(".menu-bar-login")) {
        $(".menu-col1 li .menu-user-btn").click(function() {
            $(".menu-bar-login").toggleClass("open");
        })
    }
})

