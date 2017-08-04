'use strict'

$(document).ready(function () {
    // ------------------CREATION OF THE WORD CLOUD---------------------- //
    document.getElementById('wordcloud').height = $('body').height()  * .5;
    document.getElementById('wordcloud').width = $('body').width() * .60;

    let size = 1;

    let testList = [['Web Technologies', 26], ['HTML', 20], ['<canvas>', 20], ['CSS', 15], ['Javascript', 15], ['Document Object Model', 12]];
    WordCloud(document.getElementById('wordcloud'), {
        list: testList,
        //minSize: 16 
        gridSize: Math.round(16 * $('#wordcloud').width() / 1024),
        weightFactor: function (size) {
            return Math.pow(size, 1.4) * $('#wordcloud').width() / 1024;
        },
        fontFamily: 'Finger Paint, cursive, sans-serif',
    });
    // ------------------------------------------------------------------- //

    
});