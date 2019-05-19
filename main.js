var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:3000/my_db', {useNewUrlParser: true});
const RateLimit = require('express-rate-limit');

const limiter = new RateLimit({
  windowMs: 15*60*1000,
  max: 100,
  delayMs: 0
});

var userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String
});
var User = mongoose.model("User", userSchema);

var styling = '<link rel=\"stylesheet\" type=\"text/css" href=\"stylez.css\">'

var app = express();

var currentUser = '';

app.use(logger('dev'));

app.use(limiter);

app.use(urlencodedParser);

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true })); 

app.use(upload.array());

app.use(express.static(path.join(__dirname, 'static')));

app.post('/createAccount.html', urlencodedParser, function(req, res) {
  var userInfo = req.body;
  if(!userInfo.name || !userInfo.email || !userInfo.password){
    res.render('show_message', {
       message: "Sorry, you provided wrong info", type: "error"});
 } else {
    var newUser = new User({
       name: userInfo.name,
       email: userInfo.email,
       password: userInfo.password
    });
    newUser.save(function(err, User){
      if(err)
         res.render('show_message', {message: "Database error", type: "error"});
      else
         res.render('show_message', {
            message: "New user added", type: "success", user: userInfo});
     });
 } 
  var html = '<head><title>Success!</title></head>' + styling +
             '<body><div id="bulk"><h1>Account Created!</h1>' +
             '<p>Your account has been successfully created.</p>' +
             '<p>Welcome, ' + userInfo.name +'</p></div></body>' +
             '<form method=\"get\" action=\"http://localhost:3000\">' +
             '<input type=\"submit\" value=\"Return to Login\"></form>';
  console.log(req.body);
  res.send(html);
});

app.post('*', urlencodedParser, function(req, res){
    var loginAttempt = req.body;
    console.log(loginAttempt.username + ' ' + loginAttempt.password);
    User.findOne({name: loginAttempt.username, password: loginAttempt.password},
            function(error, response){
               currentUser = loginAttempt.username;
               console.log(response + ' ' + currentUser);
            });
    var html = '<head><title>Success!</title></head>' + styling +
             '<body><div id="banner"><a href=\"http://localhost:3000\">Logout</a></div>' +
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
             '<td><input type=\"text\" id=\"username\" name=\"username\"></td></tr>' +
             '<tr><td class="righty">Password:&nbsp</td>' +
             '<td><input type=\"password\" id=\"password\" name=\"password\"></td></tr>' +
             '<tr><td colspan=\"2\" class=\"centery\"><input type=\"submit\"></td></tr></table></form></div></body>';
  res.send(html);
});

app.listen(3000);
console.log('Listening on port 3000');