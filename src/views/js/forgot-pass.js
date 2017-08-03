function sendToServer() {
    var email = document.getElementById('inputEmail').value;

    fetch("/users/request-reset-password", {
        method: 'post',
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            'email': email
        })
    }).then(response => { return response.json() })
        .then(json => {
            //json contains responses
        });

    if (validateEmail(email)) {
        window.location.replace("../lite-version.html");
    }
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}