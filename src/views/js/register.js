$(document).ready(function () {
    $('#signup-form').validate({ // initialize the plugin
        // makes sure it validates without submitting
        onsubmit: false,
        rules: {
            first: {
                required: true,
                lettersonly: true
            },
            last: {
                required: true,
                lettersonly: true
            },
            password: {
                required: true,
                minlength: 6,
            },
            cpassword: {
                required: true,
                equalTo: '#password'
            },
        },
        messages: {
            first: {
                required: 'Please enter you first name',
                lettersonly: 'I don\'t believe your name contains numbers'
            },
            last: {
                required: 'Please enter you last name',
                lettersonly: 'I don\'t believe your name contains numbers'
            },
            password: {
                required: 'Please provide a password',
                minlength: 'Your password must be at least 6 characters long'
            },
            cpassword: {
                required: 'Please provide a password',
                equalTo: 'Please enter the same password as above',
            }
        },

        errorElement:'div',
        errorPlacement: function(error, element) {
            var placement = $(element).data('error');
            if (placement) {
                $(placement).append(error)
            } else {
                error.insertAfter(element);
            }
        }
    });
});