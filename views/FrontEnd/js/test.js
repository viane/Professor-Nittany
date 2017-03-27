// load word cloud canvas only on profile page
$(() => {
    if (window.location.href === "http://localhost:3000/profile" || window.location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
        if (WordCloud.isSupported) {
            const url = '/api/profile/get-interest';
            fetch(url, {
                method: "GET",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                }
            }).then(function(res) {
                if (res.status !== 200) {
                    generateNotice('error', "Error, status code: " + res.status);
                    return;
                }
                res.json().then(function(result) {
                    if (result.interest.length > 0) { // if user current has some interests
                        WordCloud(document.getElementById('interest-canvas'), {
                            list: result.interest,
                            color: 'random-dark',
                            hover: window.drawBox,
                            fontFamily: 'Helvetica, sans-serif',
                            click: function(item) {
                                alert(item[0] + ': ' + item[1]);
                            },
                            gridSize: Math.round(12 * $('#interest-canvas').width() / 400),
                            weightFactor: function(size) {
                                const newsize = Math.pow(size, 2.1) * $('#interest-canvas').width() / 500 + 10;
                                return newsize;
                            },
                            rotateRatio: 0.5,
                            rotationSteps: 2
                        });
                    } else {
                        const canvas = $("#interest-canvas");
                        canvas.css({"height": "180"});
                        let ctx = canvas[0].getContext("2d");
                        ctx.font = "normal 50px Roboto sans-serif";
                        ctx.textAlign = "left";
                        ctx.fillText("Ask more questions", 60, 120);
                        ctx.fillText("Add self introduction", 60, 200);
                        ctx.fillText("To explore interests!", 60, 280);
                    }

                })
            }).catch(function(err) {
                generateNotice('error', err)
            });
        } else {
            generateNotice('warning', "Your browser doesn't support word cloud for displaying interests");
        }
    }
})

// test only, delete before productlize
$(() => {
    if (window.location.href === "http://localhost:3000/login") {
        $('#form-username').val("test@test.com");
        $('#form-password').val("test");
    }
})

// HEART RATING SYSTEM
var __sliceh = [].slice;

(function($, window) {
    var Hearrrt;

    Hearrrt = (function() {
        Hearrrt.prototype.defaults = {
            rating: void 0,
            numHearts: 1,
            change: function(e, value) {}
        };

        function Hearrrt($el, options) {
            var i,
                _,
                _ref,
                _this = this;

            this.options = $.extend({}, this.defaults, options);
            this.$el = $el;
            _ref = this.defaults;
            for (i in _ref) {
                _ = _ref[i];
                if (this.$el.data(i) != null) {
                    this.options[i] = this.$el.data(i);
                }
            }
            this.createHearrrts();
            this.syncRating();
            this.$el.on('mouseover.hearrrt', 'span', function(e) {
                return _this.syncRating(_this.$el.find('span').index(e.currentTarget) + 1);
            });
            this.$el.on('mouseout.hearrrt', function() {
                return _this.syncRating();
            });
            this.$el.on('click.hearrrt', 'span', function(e) {
                return _this.setRating(_this.$el.find('span').index(e.currentTarget) + 1);
            });
            this.$el.on('hearrrt:change', this.options.change);
        }

        Hearrrt.prototype.createHearrrts = function() {
            var _i,
                _ref,
                _results;

            _results = [];
            for (_i = 1, _ref = this.options.numHearts; 1 <= _ref
                ? _i <= _ref
                : _i >= _ref; 1 <= _ref
                ? _i++
                : _i--) {
                _results.push(this.$el.append("<span class='glyphicon .glyphicon-heart-empty'></span>"));
            }
            return _results;
        };

        Hearrrt.prototype.setRating = function(rating) {
            if (this.options.rating === rating) {
                rating = void 0;
            }
            this.options.rating = rating;
            this.syncRating();
            return this.$el.trigger('hearrrt:change', rating);
        };

        Hearrrt.prototype.syncRating = function(rating) {
            var i,
                _i,
                _j,
                _ref;

            rating || (rating = this.options.rating);
            if (rating) {
                for (i = _i = 0, _ref = rating - 1; 0 <= _ref
                    ? _i <= _ref
                    : _i >= _ref; i = 0 <= _ref
                    ? ++_i
                    : --_i) {
                    this.$el.find('span').eq(i).removeClass('glyphicon-heart-empty').addClass('glyphicon-heart');
                }
            }
            if (rating && rating < 5) {
                for (i = _j = rating; rating <= 4
                    ? _j <= 4
                    : _j >= 4; i = rating <= 4
                    ? ++_j
                    : --_j) {
                    this.$el.find('span').eq(i).removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
                }
            }
            if (!rating) {
                return this.$el.find('span').removeClass('glyphicon-heart').addClass('glyphicon-heart-empty');
            }
        };

        return Hearrrt;

    })();
    return $.fn.extend({
        hearrrt: function() {
            var args,
                option;

            option = arguments[0],
            args = 2 <= arguments.length
                ? __sliceh.call(arguments, 1)
                : [];
            return this.each(function() {
                var data;

                data = $(this).data('heart-rating');
                if (!data) {
                    $(this).data('heart-rating', (data = new Hearrrt($(this), option)));
                }
                if (typeof option === 'string') {
                    return data[option].apply(data, args);
                }
            });
        }
    });
})(window.jQuery, window);

$(function() {
    return $(".hearrrt").hearrrt();
});

$(document).ready(function() {

    $('#hearts').on('hearrrt:change', function(e, value) {
        $('#count').html(value);
    });

    $('#hearts-existing').on('hearrrt:change', function(e, value) {
        $('#count-existing').html(value);
    });
});

// Starrr plugin (https://github.com/dobtco/starrr)
var __slice = [].slice;

(function($, window) {
    var Starrr;

    Starrr = (function() {
        Starrr.prototype.defaults = {
            rating: void 0,
            numStars: 5,
            change: function(e, value) {}
        };

        function Starrr($el, options) {
            var i,
                _,
                _ref,
                _this = this;

            this.options = $.extend({}, this.defaults, options);
            this.$el = $el;
            _ref = this.defaults;
            for (i in _ref) {
                _ = _ref[i];
                if (this.$el.data(i) != null) {
                    this.options[i] = this.$el.data(i);
                }
            }
            this.createStars();
            this.syncRating();
            this.$el.on('mouseover.starrr', 'span', function(e) {
                return _this.syncRating(_this.$el.find('span').index(e.currentTarget) + 1);
            });
            this.$el.on('mouseout.starrr', function() {
                return _this.syncRating();
            });
            this.$el.on('click.starrr', 'span', function(e) {
                return _this.setRating(_this.$el.find('span').index(e.currentTarget) + 1);
            });
            this.$el.on('starrr:change', this.options.change);
        }

        Starrr.prototype.createStars = function() {
            var _i,
                _ref,
                _results;

            _results = [];
            for (_i = 1, _ref = this.options.numStars; 1 <= _ref
                ? _i <= _ref
                : _i >= _ref; 1 <= _ref
                ? _i++
                : _i--) {
                _results.push(this.$el.append("<span class='glyphicon .glyphicon-star-empty'></span>"));
            }
            return _results;
        };

        Starrr.prototype.setRating = function(rating) {
            if (this.options.rating === rating) {
                rating = void 0;
            }
            this.options.rating = rating;
            this.syncRating();
            return this.$el.trigger('starrr:change', rating);
        };

        Starrr.prototype.syncRating = function(rating) {
            var i,
                _i,
                _j,
                _ref;

            rating || (rating = this.options.rating);
            if (rating) {
                for (i = _i = 0, _ref = rating - 1; 0 <= _ref
                    ? _i <= _ref
                    : _i >= _ref; i = 0 <= _ref
                    ? ++_i
                    : --_i) {
                    this.$el.find('span').eq(i).removeClass('glyphicon-star-empty').addClass('glyphicon-star');
                }
            }
            if (rating && rating < 5) {
                for (i = _j = rating; rating <= 4
                    ? _j <= 4
                    : _j >= 4; i = rating <= 4
                    ? ++_j
                    : --_j) {
                    this.$el.find('span').eq(i).removeClass('glyphicon-star').addClass('glyphicon-star-empty');
                }
            }
            if (!rating) {
                return this.$el.find('span').removeClass('glyphicon-star').addClass('glyphicon-star-empty');
            }
        };

        return Starrr;

    })();
    return $.fn.extend({
        starrr: function() {
            var args,
                option;

            option = arguments[0],
            args = 2 <= arguments.length
                ? __slice.call(arguments, 1)
                : [];
            return this.each(function() {
                var data;

                data = $(this).data('star-rating');
                if (!data) {
                    $(this).data('star-rating', (data = new Starrr($(this), option)));
                }
                if (typeof option === 'string') {
                    return data[option].apply(data, args);
                }
            });
        }
    });
})(window.jQuery, window);

$(function() {
    return $(".starrr").starrr();
});

$(document).ready(function() {
    $('#stars').on('starrr:change', function(e, value) {
        $('#count').html(value);
    });

    $('#stars-existing').on('starrr:change', function(e, value) {
        $('#count-existing').html(value);
    });
});

//enable tooltips
$(document).ready(function() {
    $('[data-toggle="tooltip"]').tooltip();
});

// code to change avatar
$(() => {
    $("#submit-avatar-input").on('change', function() {
        const url = '/api/profile/update-avatar';

        const data = new FormData();
        data.append("file", $('#submit-avatar-input')[0].files[0]);

        fetch(url, {
            method: "POST",
            credentials: 'include',
            body: data
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', "Error, status code: " + res.status);
                return;
            } else {
                res.json().then(function(result) {
                    generateNotice(result.type, result.information);
                    $('#user-avatar').prop("src", result.avatarPath + '?' + Math.random());
                })
            }

        }).catch(function(err) {
            generateNotice('error', err)
        });
    });
});

// get advisor list when user sending generated assessment and to advisors
$(() => {
    $('#goto-advisor-list-btn').on('click', () => {
        const url = '/api/server-status/get-advisor-list';
        fetch(url, {
            method: "GET",
            credentials: 'include'
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', "Error, status code: " + res.status);
                return;
            } else {
                res.json().then(function(result) {
                    // clear pannel
                    $('.advisor-list-panel').html("");
                    // render advisors
                    result.advisors.map((advisor) => {
                        let advisorDom = "<figure class=\"advisor-profile-wrapper\">";
                        // profile image
                        advisorDom += "<div class=\"profile-image\"><img src=\"" + advisor.avatar + "\"/></div>";
                        advisorDom += "<figcaption>";
                        // checkbox
                        advisorDom += "<label class=\"checkbox checkbox--four\"><div style=\"display:none\" data-advisor-id=\"" + advisor.id + "\" data-advisor-email=\"" + advisor.email + "\" data-advisor-displayName=\"" + advisor.displayName + "\"></div><input class=\"advisor-check-input\" type=\"checkbox\" /><span></span></label>";
                        // displayName
                        advisorDom += "<h3>" + advisor.displayName + "</h3>";
                        // email
                        advisorDom += "<h4>" + advisor.email + "</h4>";
                        // interest
                        let interestContent = "";
                        advisor.interest.map((interest) => {
                            interestContent += interest.toString();
                        });
                        advisorDom += "<p>" + interestContent + "</p>";
                        advisorDom += "</figcaption>"
                        advisorDom += "</figure>";
                        $('.advisor-list-panel').append(advisorDom);
                    });
                    $(".loader").css('display', 'none');
                })
            }
        }).catch(function(err) {
            generateNotice('error', err);
            $(".loader").css('display', 'none');
        });
    });
})

//////////////////////////////////////////////
// Display question history on profile page
//////////////////////////////////////////////
$(() => {
    if (location.href === "http://localhost:3000/profile" || location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
        questionHistory.map((logedQuestionObj) => {

            let respond = "<li class=\"list-group-item text-left\">"

            //add favorite btn to answer
            respond += "<div id=\"hearts-existing\" class=\"hearrrt\" data-toggle=\"tooltip\" data-container=\"body\" data-placement=\"right\" title=\"Favorite!\" data-favortite = \"true\"></div>";

            //add answer body and
            respond += "<div class=\"question-log-question-body\"><p class=\"question-body\">" + logedQuestionObj.question_body + "</p></div>";

            respond += "</li>"

            // display user favorited question
            if (logedQuestionObj.favorite) {
                $('#favorite-question-list').append(respond);
            }

            // display user question history
            if (!logedQuestionObj.favorite) {
                $('#asked-question-list').append(respond);
            }

        })

        // enable heart icon functionality
        $(".hearrrt").hearrrt();

        // mannual mark up each favorite question
        $('#favorite-question-list .hearrrt span').each(function() {
            $(this).click()
        });
    }
})

//////////////////////////////////////////
// Password strength validation
//////////////////////////////////////////

$(() => {
    const lowerLetterRegex = new RegExp("(?=.*[a-z])");
    const upperLetterRegex = new RegExp("(?=.*[A-Z])");
    const numberRegex = new RegExp("(?=.*[0-9])");
    const lengthRegex = new RegExp("(?=.{8,})");
    const spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
    $('#signup-form-password').on('focus', () => {
        $('.password-rule-list').fadeIn("slow")
    });
    $('#signup-form-password').on('focusout', () => {
        $('.password-rule-list').fadeOut("fast")
    })
    $('#signup-form-password').on('keyup', function() {
        const password = $(this).val();
        if (password.length == 0) {
            $('#password-lower-letter-condition-icon').addClass("fa-square-o").removeClass("fa-check-square-o").removeClass("fa-minus-square-o");
            $('#password-lower-letter-condition').css('color', 'lightgray');

            $('#password-upper-letter-condition-icon').addClass("fa-square-o").removeClass("fa-check-square-o").removeClass("fa-minus-square-o");
            $('#password-upper-letter-condition').css('color', 'lightgray');

            $('#password-number-condition-icon').addClass("fa-square-o").removeClass("fa-check-square-o").removeClass("fa-minus-square-o");
            $('#password-number-condition').css('color', 'lightgray');

            $('#password-length-condition-icon').addClass("fa-square-o").removeClass("fa-check-square-o").removeClass("fa-minus-square-o");
            $('#password-length-condition').css('color', 'lightgray');

            $('#password-special-letter-condition-icon').addClass("fa-square-o").removeClass("fa-check-square-o").removeClass("fa-minus-square-o");
            $('#password-special-letter-condition').css('color', 'lightgray');

        } else {
            // lower case letter check
            if (!lowerLetterRegex.test(password)) {
                $('#password-lower-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-check-square-o").addClass("fa-minus-square-o");
                $('#password-lower-letter-condition').css('color', 'red');
            } else {
                $('#password-lower-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-minus-square-o").addClass("fa-check-square-o");
                $('#password-lower-letter-condition').css('color', 'darkseagreen');
            }

            // upper case letter check
            if (!upperLetterRegex.test(password)) {
                $('#password-upper-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-check-square-o").addClass("fa-minus-square-o");
                $('#password-upper-letter-condition').css('color', 'red');
            } else {
                $('#password-upper-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-minus-square-o").addClass("fa-check-square-o");
                $('#password-upper-letter-condition').css('color', 'darkseagreen');
            }

            // number check
            if (!numberRegex.test(password)) {
                $('#password-number-condition-icon').removeClass("fa-square-o").removeClass("fa-check-square-o").addClass("fa-minus-square-o");
                $('#password-number-condition').css('color', 'red');
            } else {
                $('#password-number-condition-icon').removeClass("fa-square-o").removeClass("fa-minus-square-o").addClass("fa-check-square-o");
                $('#password-number-condition').css('color', 'darkseagreen');
            }

            // length check
            if (!lengthRegex.test(password)) {
                $('#password-length-condition-icon').removeClass("fa-square-o").removeClass("fa-check-square-o").addClass("fa-minus-square-o");
                $('#password-length-condition').css('color', 'red');
            } else {
                $('#password-length-condition-icon').removeClass("fa-square-o").removeClass("fa-minus-square-o").addClass("fa-check-square-o");
                $('#password-length-condition').css('color', 'darkseagreen');
            }

            // special letter check
            if (spcialCharRegex.test(password)) {
                $('#password-special-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-check-square-o").addClass("fa-minus-square-o");
                $('#password-special-letter-condition').css('color', 'red');
            } else {
                $('#password-special-letter-condition-icon').removeClass("fa-square-o").removeClass("fa-minus-square-o").addClass("fa-check-square-o");
                $('#password-special-letter-condition').css('color', 'darkseagreen');
            }
        }
    })
})
