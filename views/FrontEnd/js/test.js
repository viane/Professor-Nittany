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
                            color: "random-dark",
                            fontFamily: 'Helvetica, sans-serif',
                            gridSize: Math.round(12 * $('#interest-canvas').width() / 400),
                            weightFactor: function(size) {
                                const newsize = Math.pow(size, 2.1) * $('#interest-canvas').width() / 500 + 10;
                                return newsize;
                            },
                            rotateRatio: 45,
                            rotationSteps: 0
                        });
                    } else {
                        const canvas = $("#interest-canvas");
                        canvas.css({"height":"180"});
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
