/*global $*/
//event handler for menu bar
$(document).ready(function() {
    $(".menu-col1 li .menu-user-btn").click(function() {
        $(".menu-bar-login").toggleClass("open");
    })
})