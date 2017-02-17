// load word cloud canvas only on profile page
$(() => {
    if (window.location.href === "http://localhost:3000/profile" || window.location.href === "https://intelligent-student-advisor.herokuapp.com/profile") {
        if (WordCloud.isSupported) {
            const url = '/api/account/get-interest';
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

//code to change avatar
$(document).ready(function() {
    $("#avatar-fileid").on('change', function() {
        $("#user-avatar").attr('src', jQuery(this).val());
    });
});

// //update content on profile
// http://mycodingtricks.com/html5/html5-inline-edit-with-mysql-php-jquery-and-ajax/
// $(document).ready(function(){
//            $("p[contenteditable=true]").blur(function(){
//                var msg = $(".alert");
//                var newvalue = $(this).text();
//                var field = $(this).attr("id");
//                $.post("update.php",field+"="+newvalue,function(d){
//                    var data = JSON.parse(d);
//                    msg.removeClass("hide");
//                     if(data.status == '200'){
//                         msg.addClass("alert-success").removeClass("alert-danger");
//                     }else{
//                         msg.addClass("alert-danger").removeClass("alert-success");
//                     }
//                    msg.text(data.response);
//                    setTimeout(function(){msg.addClass("hide");},3000);//It will add hide class after 3 seconds
//                });
//            });
//         });
