// load word cloud canvas only on profile page, wordCloud, wordcloud
$(() => {
    if (window.location.href === "http://localhost:3000/profile" || window.location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
        if (WordCloud.isSupported) {
            fetchAndRenderInterest();
        } else {
            generateNotice('warning', "Your browser doesn't support displaying interests");
        }
    }
})

// test only, delete before productlize
$(() => {
    if (window.location.href === "http://localhost:3000/login") {
        $('#form-username').val("xiaoyuz2011@gmail.com");
        $('#form-password').val("Zsbqwacc0");
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
                        // interest
                        let interestContent = "Specialty: ";
                        if (advisor.interest.length>0) {
                          advisor.interest.map((interest, index) => {
                              interestContent += interest.term;
                              if (index < advisor.interest.length -1) {
                                interestContent += ", ";
                              }
                          })
                        }else{
                          interestContent += "Unknown";
                        }
                        advisorDom += "<p>" + interestContent + "</p>";
                        advisorDom += "</figcaption>"
                        advisorDom += "</figure>";

                        $('.advisor-list-panel').append(advisorDom);
                    });
                    $(".loader").fadeOut('fast');
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

            if (logedQuestionObj.favorite) {
                //add favorite btn to answer
                respond += "<div id=\"hearts-existing\" class=\"hearrrt question-fav-btn\" data-toggle=\"tooltip\" data-container=\"body\" data-placement=\"right\" title=\"Favorite!\" data-favortite = \"true\"></div>";
            } else {
                respond += "<div class=\"question-history-delete-btn\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></div>";
            }
            //add question and answer body
            respond += "<div class=\"question-log-question-body\"><p class=\"question-body\"><b>" + logedQuestionObj.question_body + "</b></p></div>";
            respond += "<div class=\"question-log-answer-body\">" + logedQuestionObj.answer_body + "</div>";
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

        // add read more handler
        addReadmoreHandler();

        // add ask answer related question handler
        addAnswerRelatedQuestionHandler();
    }
})

//////////////////////////////////////////////////////////////////////////////////
// handler for question fav/history delete btn
//////////////////////////////////////////////////////////////////////////////////
$(() => {
    const initQuestionDeleteBtnHandler = () => {
        // delete question from question history
        $('.question-history-delete-btn').click(function() {
            const section = $(this).parent();
            const questionContent = $(this).next().text();

            const url = '/api/profile/delete-question-history';
            fetch(url, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                body: 'question_body=' + questionContent
            }).then(function(res) {
                if (res.status !== 200) {
                    generateNotice('error', 'Failed to request, please try again later or contact us.');
                    return;
                } else {
                    // success
                    section.fadeOut('fast');
                }
            }).catch(function(err) {
                generateNotice('error', err);
            });
        });
    }

    initQuestionDeleteBtnHandler();

    // unfav question
    $('.question-fav-btn').click(function() {
        const $this = $(this);
        const favQuestionBody = $(this).next().text();
        const favAnswerBody = $(this).next().next().html();
        const url = '/api/profile/unfav-question-history';
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'question_body=' + favQuestionBody
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please try again later or contact us.');
                return;
            } else {
                // success
                $this.parent().fadeOut('slow', function() {
                    $this.remove();
                    // push back to regular question log with style
                    let respond = "<li class=\"list-group-item text-left\">";
                    respond += "<div class=\"question-history-delete-btn\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></div>";
                    respond += "<div class=\"question-log-question-body\"><p class=\"question-body\">" + favQuestionBody + "</p></div>";
                    respond += "<div class=\"question-log-answer-body\">" + favAnswerBody + "</div>";
                    respond += "</li>"
                    $('#asked-question-list').append(respond);
                    initQuestionDeleteBtnHandler();

                    // add read more handler
                    addReadmoreHandler();

                    // add ask answer related question handler
                    addAnswerRelatedQuestionHandler();
                });
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    });
})

//////////////////////////////////////////////////////////////////////////////////
// handler for Edit bar/buttons for introduction and interest on profile page
//////////////////////////////////////////////////////////////////////////////////
$(() => {
    let introductionCopy = $('#introduction-content-p').text();

    // show edit bar when user focus on introduction
    $('#introduction-content-p').on('focus', function() {
        $(this).next().show('fast');
    });

    // always show interest input
    $('#user-interest-tags').next().show('fast');

    // save, cancel, undo, redo button for introduction
    $('#introduction-undo-btn').click(() => {
        document.execCommand('undo', false, null);
    });

    $('#introduction-redo-btn').click(() => {
        document.execCommand('redo', false, null);
    });

    $('#introduction-cancel-btn').click(() => {
        $('#introduction-content-p').text(introductionCopy);
    });

    $('#introduction-save-btn').click(() => {
        // form input string to txt binary
        const data = $('#introduction-content-p').text().trim();
        if (introductionCopy === $('#introduction-content-p').text()) {
            generateNotice('warning', 'Please make a change on your introduction before submit.');
            return;
        }
        const url = '/api/profile/upload/update-introduction';
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'introdcution=' + data
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please save your introduction somewhere else and try again later or contact us.');
                return;
            } else {
                generateNotice('success', 'Success update your introdcution.');
                // update copy
                introductionCopy = $('#introduction-content-p').text();
                fetchAndRenderInterest();
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    });

    $('#interest-save-btn').click(() => {
        let interestAry = [];

        $('#user-interest-tags span').map((index, interest) => {
            interestAry.unshift($(interest).text().trim().toString());
        });

        const url = '/api/profile/update-interest-manual';
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'interest_manual=' + JSON.stringify(interestAry)
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please save your interest somewhere else and try again later or contact us.');
                return;
            } else {
                generateNotice('success', 'Success update your interest.');
                fetchAndRenderInterest();
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });

    });
})

//////////////////////////////////////////////////////////////////////////////////
// handler for tag for interest on profile page
//////////////////////////////////////////////////////////////////////////////////
$(() => {
    if (location.href === "http://localhost:3000/profile" || location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
        // on profile load, load interest from server
        const url = '/api/profile/get-interest-manual';
        fetch(url, {
            method: "GET",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed load your interest from server, please reload the page or contact us.');
                return;
            } else {
                // load interest input bar
                res.json().then((interest_raw) => {
                    interest_raw.interestAry[0].map((interestObj, index) => {
                        //interestObj = [{'term','value'}]
                        $('#user-interest-tags').append('<span>' + interestObj.term + '</span>')
                    })

                });
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    }
    // on save
    $("#user-interest-tags input").on({
        focusout: function() {
            // when user click outside direct without comma or return
            if (this.value.length < 2) {
                return generateNotice('warning', 'Interest term you entered is too short.');
            }
            var txt = this.value.replace(/[^a-z0-9A-Z\+\-\.\#\ ]/ig, ''); // allowed characters
            if (txt)
                $("<span/>", {
                    text: txt,
                    insertBefore: this
                });
            this.value = "";
        },
        keyup: function(ev) {
            // if: comma|enter|tab (delimit more keyCodes with | pipe)
            if (/(188|13)/.test(ev.which)) {
                // if interest term is longer than 2 characters
                if (/(188)/.test(ev.which)) { // end by comma
                    if (this.value.length < 3) {
                        return generateNotice('warning', 'Interest term you entered is too short.');

                    }
                }
                if (/(13)/.test(ev.which)) { // end by return
                    if (this.value.length < 2) {
                        return generateNotice('warning', 'Interest term you entered is too short.');

                    }

                }
                $(this).focusout().focus();
            }
        }
    });
    $('#user-interest-tags').on('click', 'span', function() {
        $(this).remove();
    });
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
    $('.signup-form-password').on('focus', () => {
        $('.password-rule-list').fadeIn("slow")
    });
    $('.signup-form-password').on('focusout', () => {
        $('.password-rule-list').fadeOut("fast")
    })
    $('.signup-form-password').on('keyup', function() {
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
});

//////////////////////////////////////////
// Reset Password
//////////////////////////////////////////
$(() => {
    $("#reset-password-form").on("submit", function(e) {
        e.preventDefault();
        const url = '/api/account/reset-password';
        const form = $(this),
            formId = form.attr('id');
        const query = $("#" + formId).serialize();
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: query
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please try again later or contact us.');
                return;
            } else {
                res.json().then(function(result) {
                    generateNotice(result.type, result.information);
                    // add promt info of token expeiration time
                })
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    });
});

$(() => {
    $("#update-password-form").on("submit", function(e) {
        e.preventDefault();
        // password checking
        const passwordValidRegex = new RegExp("(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})");
        const spcialCharRegex = new RegExp("(?=.*[!@#\$%\^&\*])");
        const password = $('.signup-form-password').val();
        if (!passwordValidRegex.test(password) || spcialCharRegex.test(password) || password.length == 0) {
            generateNotice('error', 'Invalid password format, please check the rules of password.');
            $('.password-rule-list').fadeIn('fast').effect("shake");
            return;
        }
        const url = '/api/account/update-password';
        const password1 = $('#password-primary');
        const password2 = $('#password-secondary');
        if (password1.val() !== password2.val()) {
            password1.effect("shake");
            password2.effect("shake");
            return generateNotice('error', 'Passwords doesn\'t match.');
        }
        const form = $(this),
            formId = form.attr('id');
        const query = $("#" + formId).serialize();
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: query
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please try again later or contact us.');
                return;
            } else {
                res.json().then(function(result) {
                    if (result.type === "redirect") {
                        window.location.replace(result.url)
                    }
                    generateNotice(result.type, result.information);
                    if (result.type === "success") {
                        setTimeout(() => {
                            window.location.replace('/profile');
                        }, 1500);
                    }
                })
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    });
});

//////////////////////////////////////////
// Get user assessments in inbox page
//////////////////////////////////////////
$(() => {
    if (location.href === "http://localhost:3000/inbox" || location.href === "https://intelligent-student-advisor.herokuapp.com/inbox") {
        // inbox tab click handler
        $('#inbox-navigation a').click(function(e) {
            e.preventDefault();
            $('.inbox-tab .content-container').css('display', 'none');
            const toggleTabName = $(this).data('tab');
            $('#' + toggleTabName).css('display', 'block');
        });

        // bind tab toggle handlers
        $('#inbox-navigation a').each((index, element) => {
            const targetBtn = $(element).data('tab');
            switch (targetBtn) {
                case "show-inbox":
                    $(element).click(() => {
                        getAndRenderUserInboxAssessment();
                    });
                    break;
                case "show-trash":

                    break;
                default:

            }

        })
        // mannual open first tab on load
        $($('#inbox-navigation a')[0]).click();
    }
})

const getAndRenderUserInboxAssessment = () => {
    // clear previous assessments
    $('#show-inbox .row .mail-list').empty();
    // add loader
    $('#show-inbox .row').append("<div class=\"loader\"></div>")
    const url = '/api/profile/get-inbox-assessment';
    fetch(url, {
        method: "GET",
        credentials: 'include',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    }).then(function(res) {
        if (res.status !== 200) {
            generateNotice('error', 'Failed to get your assessment, please try again later or contact us.');
            return;
        } else {
            res.json().then(function(result) {
                let unreadCounter = 0;
                result.inbox_assessment.map((assessment) => {
                    const inboxItemWrapper = parseInboxAssessment(assessment);
                    // end of wrapper
                    $('#assessment-box-list').append(inboxItemWrapper);
                });
                if (unreadCounter > 0) {
                    $('#inbox-in-badge').text(unreadCounter);
                }
                // remove loader
                $('.loader').remove();
            });
        }
    }).catch(function(err) {
        generateNotice('error', err);
    });
}

const parseInboxAssessment = (assessment) => {
    let inboxItemWrapper = "<li><div class=\"container col-sm-12 mail-header\">";
    // display assessment owner name for advisor only
    if (assessment.owner_display_name) {
      inboxItemWrapper += "<span class=\"mail-owner-name\">Student: " + assessment.owner_display_name + "</span>";
    }
    // display selected section in title with link to full assessment report
    inboxItemWrapper += "<a href=\"/api/profile/get-assessment/" + assessment._id + "\">";
    inboxItemWrapper += "<span class=\"mail-titile\">Assessment of ";
    assessment.view_section.map((section, index) => {
        if (index > 0) {
            inboxItemWrapper += ', ';
        }
        inboxItemWrapper += "<b>" + section.charAt(0).toUpperCase() + section.substring(1);;
        inboxItemWrapper += "</b>"
    });
    inboxItemWrapper += "</span></a>";
    // display assessment generated time and how long ago
    inboxItemWrapper += "<span class=\"mail-date\">" + moment(assessment.request_time).format('MMMM Do YYYY') + "</span>";
    inboxItemWrapper += "<span class=\"mail-date\">" + moment(assessment.request_time).fromNow() + "</span>";
    // display if advisor(s) has made change(s) before last user access the full report
    if (!assessment.user_viewed_before_change) {
        unreadCounter++;
        inboxItemWrapper += "<span class=\"mail-comment-note-right\"> One or more advisor(s) made a new comment on this assessment!</span>";
        inboxItemWrapper += "<span class=\"mail-comment-time-right\">" + moment(assessment.advisor_last_comment_time).fromNow() + "</span>";
    }

    //////////////////////////////////////////
    // display summary of selected section in assessment
    //////////////////////////////////////////
    if (assessment.view_section.includes("introduction")) {
        inboxItemWrapper += "<span class=\"mail-introduction\"> Introduction: " + assessment.introduction + "</span>";
    }
    if (assessment.view_section.includes("interest")) {
        inboxItemWrapper += "<span class=\"mail-interest\"> Interest: " + assessment.interest + "</span>";
    }
    if (assessment.view_section.includes("personality")) {
        inboxItemWrapper += "<span class=\"mail-personality\"> Personality Analysis: " + assessment.personality + "</span>";
    }
    if (assessment.view_section.includes("introduction")) {
        inboxItemWrapper += "<span class=\"mail-question\"> Question History: " + assessment.question + "</span>";
    }

    inboxItemWrapper += "</div></li>";
    return inboxItemWrapper;
}

// main page fav btn handler
const favoriteBtnHandler = () => {
    $('.question-fav-btn-main').click(function() {
        const answerPair = $(this).next().html(); // include style
        const favQuestionBody = $('#user-question').text();
        const url = '/api/profile/fav-question-answer';
        fetch(url, {
            method: "POST",
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: 'question_body=' + favQuestionBody + '&answer=' + answerPair
        }).then(function(res) {
            if (res.status !== 200) {
                generateNotice('error', 'Failed to request, please try again later or contact us.');
                return;
            } else {
                // success
                generateNotice('success', 'Successfully favorite this answer with you question.');
            }
        }).catch(function(err) {
            generateNotice('error', err);
        });
    })
}

// fetch user interest and render word cloud to display
const fetchAndRenderInterest = () => {
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
            setTimeout(() => {
                if (result.interest.length > 0) { // if user current has some interests
                    WordCloud($('#interest-canvas')[0], {
                        list: result.interest,
                        color: 'random-dark',
                        hover: window.drawBox,
                        fontFamily: 'Helvetica, sans-serif',
                        click: function(item) {
                            console.log(item[0] + ': ' + item[1]);
                        },
                        gridSize: Math.round(16 * $('#interest-canvas').width() / 1200),
                        weightFactor: function(size) {
                            return Math.pow(size, 2.3) * $('#interest-canvas').width() / 500 + 10;
                        },
                        minSize: 10,
                        clearCanvas: true,
                        rotateRatio: 0,
                        rotationSteps: 0
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
            }, 0);
        })
    }).catch(function(err) {
        generateNotice('error', err)
    });
};

////////////////////////////////////////////////////////////////////////
// Send assessment to advisor
////////////////////////////////////////////////////////////////////////
$(() => {
    $("#assessment-send-btn").click(() => {
        let payload = {
            viewSection: [],
            receiveAdvisor: []
        }

        // form open section to be viewed by advisor
        $('.assessment-section-selection input:checked').each(function() {
            payload.viewSection.unshift($(this).val());
        })

        // form receiving advisors array
        $('.advisor-profile-wrapper input:checked').each(function() {
            const receiverID = $(this).prev('div').data('advisor-id');
            const receiverEmail = $(this).prev('div').data('advisor-email');
            const receiverDisplayName = $(this).prev('div').data('advisor-displayname');
            const receiverObj = {
                id: receiverID,
                email: receiverEmail,
                displayName: receiverDisplayName
            };
            payload.receiveAdvisor.unshift(receiverObj);
        });

        // checking any missing field
        if (payload.viewSection.length === 0) {
            // empty assessment section
            generateNotice('warning', 'Please select at least <b>1</b> section to be viewed by advisors');
        } else if (payload.receiveAdvisor.length === 0) {
            // no advisor select
            generateNotice('warning', 'Please select at least <b>1</b> advisor to view your assessment');
        } else {
            // all good, post to API
            const url = '/api/profile/send-assessment';

            fetch(url, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                body: "advisor=" + JSON.stringify(payload)
            }).then(function(res) {
                if (res.status !== 200) {
                    generateNotice('error', "Error, status code: " + res.status);
                    return;
                } else {
                    generateNotice('success', 'Successfully generate your assessment and send to the advisor!');
                    setTimeout(() => {
                        // clear selected view profile sections
                        $('.assessment-section-selection input:checked').each(function(index, input) {
                            $(input).click()
                        });
                        // clear selected advisors
                        $('.advisor-list-panel input:checked').each(function(index, input) {
                            $(input).click()
                        });
                        $('.close-modal').click();
                    }, 1500);
                }
            }).catch(function(err) {
                generateNotice('error', err)
            });
        }
    })
})

const addRequestLastAssessmentHandler = () => {
    $('#getLastAssessment').click(() => {
        const url = '/api/profile/get-last-assessment';
        fetch(url, {
            method: "GET",
            credentials: 'include'
        }).then(function(res) {
            if (res.status !== 200) {
                return generateNotice('error', "Error");
            } else {
                res.json().then((result) => {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.assessment));
                    const dlAnchorElem = document.getElementById('downloadAnchorElem');
                    dlAnchorElem.setAttribute("href", dataStr);
                    dlAnchorElem.setAttribute("download", "assessment.json");
                    dlAnchorElem.click();
                }).catch((err) => {
                    console.error(err);
                })
            }
        }).catch(function(err) {
            generateNotice('error', err)
        });
    });
}
