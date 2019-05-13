var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var styling = '<link rel=\"stylesheet\" type=\"text/css" href=\"stylez.css\">'

var app = express();

app.use(logger('dev'));

app.use(urlencodedParser);

app.use(express.static(path.join(__dirname, 'static')));

app.post('/createAccount.html', urlencodedParser, function(req, res) {
  var html = '<head><title>Success!</title></head>' + styling +
             '<body><div id="bulk"><h1>Account Created!</h1>' +
             '<p>Your account has been successfully created.</p></div></body>' +
             '<form method=\"get\" action=\"http://localhost:3000\">' +
             '<input type=\"submit\" value=\"Return to Login\"></form>';
  res.send(html);
});

app.post('*', urlencodedParser, function(req, res){
    var html = '<head><title>Success!</title></head>' + styling +
             '<body><div id="banner"></div>' +
             '<div id="bulk"><h1>Login Successful</h1>' +
             '<p>Welcome to my website.<br>I am working on implementing a login</p></div></body>';
    res.send(html);
});

app.get('*', function(req, res) {
  var html = '<head><title>Login</title></head>' + styling +
             '<body><div id=\"banner\"><a href=\"http://localhost:3000/createAccount.html\">Create Account</a></div>' + 
             '<div id=\"bulk\"><h1>Welcome, Friend</h1>' +
             '<form method=\"post\"><table>' +
             '<tr><td class="righty">Username:&nbsp</td>' +
             '<td><input type=\"text\" id=\"username\"></td></tr>' +
             '<tr><td class="righty">Password:&nbsp</td>' +
             '<td><input type=\"password\" id=\"password\"></td></tr>' +
             '<tr><td colspan=\"2\" class=\"centery\"><input type=\"submit\"></td></tr></table></form></div></body>';
  res.send(html);
});

app.listen(3000);
console.log('Listening on port 3000');