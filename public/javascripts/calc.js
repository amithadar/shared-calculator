$(function () {
    //"use strict";

    // for better performance - to avoid searching in DOM
    var status = $('#status');

    var viewOnScreen = '';
    // my color assigned by the server
    var myColor = false;
    // my name sent to the server
    var myName = false;

    var calculatorScreen = $('#calculatorScreen');
    var input = $('#input');

    var currentExpression = '0';

    // if user is running mozilla then use it's built-in WebSocket
    window.WebSocket = window.WebSocket || window.MozWebSocket;

    // if browser doesn't support WebSocket, just show some notification and exit
    if (!window.WebSocket) {
        calculatorScreen.html($('<p>', {
            text: 'Sorry, but your browser doesn\'t '
            + 'support WebSockets.'
        }));
        input.hide();
        $('span').hide();
        return;
    }

    // open connection
    var connection = new WebSocket('ws://127.0.0.1:1337');

    connection.onopen = function () {
        // first we want users to enter their names
        input.removeAttr('disabled');
        status.text('Choose name:');
    };

    connection.onerror = function (error) {
        // just in there were some problems with conenction...
        calculatorScreen.html($('<p>', {
            text: 'Sorry, but there\'s some problem with your '
            + 'connection or the server is down.'
        }));
    };

    // most important part - incoming messages
    connection.onmessage = function (message) {

        // try to parse JSON message. Because we know that the server always returns
        // JSON this should work without any problem but we should make sure that
        // the massage is not chunked or otherwise damaged.
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('This doesn\'t look like a valid JSON: ', message.data);
            return;
        }
        // NOTE: if you're not sure about the JSON structure
        // check the server source code above
        //if (json.type === 'color') { // first response from the server with user's color
        //    myColor = json.data;
        //    status.text(myName + ': ').css('color', myColor);
        //    input.removeAttr('disabled').focus();
        //    // from now user can start sending messages
        //} else if (json.type === 'history') { // entire message history
        //    // insert every single message to the chat window
        //    for (var i=0; i < json.data.length; i++) {
        //        //addMessage(json.data[i].author, json.data[i].text,
        //        //    json.data[i].color, new Date(json.data[i].time));
        //    }
        //} else
        if (json.type === 'message') { // it's a single message
            //input.removeAttr('disabled'); // let the user write another message
            //addMessage(json.data.author, json.data.text,
            //    json.data.color, new Date(json.data.time));

            currentExpression = json.data.text;
            console.log("currentExpression: " + currentExpression);

            if (currentExpression[currentExpression.length - 1] === '+') {
                viewOnScreen = '+';
            }
            else {
                viewOnScreen = currentExpression.substring(currentExpression.indexOf('+') + 1);
            }
            calculatorScreen.html($('<p>', {text: viewOnScreen}));

        } else {
            console.log('Hmm..., I\'ve never seen JSON like this: ', json);
        }
    };

    /**
     * Send mesage when user presses Enter key
     */
    input.keydown(function (e) {
        if (e.keyCode === 13) {
            var msg = $(this).val();
            if (!msg) {
                return;
            }
            // send the message as an ordinary text
            connection.send(msg);
            $(this).val('');
            // disable the input field to make the user wait until server
            // sends back response
            input.attr('disabled', 'disabled');

            // we know that the first message sent from a user their name
            if (myName === false) {
                myName = msg;
            }
        }
    });

    /**
     * This method is optional. If the server wasn't able to respond to the
     * in 3 seconds then show some error message to notify the user that
     * something is wrong.
     */
    setInterval(function () {
        if (connection.readyState !== 1) {
            status.text('Error');
            input.attr('disabled', 'disabled').val('Unable to comminucate '
                + 'with the WebSocket server.');
        }
    }, 3000);

    /**
     * Add message to the chat window
     */

    function updateCalc(input_str, color, dt) { // TODO handle case of: + +, new calculation after =,
        console.log(input_str);
        if (input_str === "=") { // evaluate the expression
            // present the result
            currentExpression = eval(currentExpression);
            viewOnScreen = currentExpression;
        }
        else if (input_str === "+") { // present only the plus sign
            // add plus sign to the expression
            viewOnScreen = input_str;
            currentExpression += input_str;
        }
        else { // --> number was pressed
            // if there was a plus sign presented, present the number pressed
            //
            if (viewOnScreen === "+") {
                viewOnScreen = input_str;
                currentExpression += input_str;
            }
            else {
                viewOnScreen += input_str;
                currentExpression += input_str;
            }
        }
        calculatorScreen.html($('<p>', {text: viewOnScreen}));
        connection.send(currentExpression);

    }

    $('#b1').click(function () {
        updateCalc('1')
    });
    $('#b2').click(function () {
        updateCalc('2')
    });
    $('#b3').click(function () {
        updateCalc('3')
    });
    $('#b4').click(function () {
        updateCalc('4')
    });
    $('#b5').click(function () {
        updateCalc('5')
    });
    $('#b6').click(function () {
        updateCalc('6')
    });
    $('#b7').click(function () {
        updateCalc('7')
    });
    $('#b8').click(function () {
        updateCalc('8')
    });
    $('#b9').click(function () {
        updateCalc('9')
    });
    $('#b0').click(function () {
        updateCalc('0')
    });
    $('#bp').click(function () {
        updateCalc('+')
    });
    $('#be').click(function () {
        updateCalc('=')
    });

});

