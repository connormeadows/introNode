var path = require('path');
var express = require('express');
var logger = require('morgan');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/my_db', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
var userSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String
});
var User = mongoose.model("User", userSchema);

const RateLimit = require('express-rate-limit');
const limiter = new RateLimit({
  windowMs: 15*60*1000,
  max: 100,
  delayMs: 0
});

var app = express();

var currentUser = '';
var styling = '<link rel=\"stylesheet\" type=\"text/css" href=\"stylez.css\">';

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
 } else if(userInfo.password != userInfo.confirmPassword){
    res.render('show_message', {
      message: "Passwords do not match", type: "error"
    });
 } else {
    var newUser = new User({
       name: userInfo.name,
       email: userInfo.email,
       password: userInfo.password
    });
    newUser.save(function(err){
      if(err)
         return handleError(err);
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
    console.log(loginAttempt.username + ' ' + loginAttempt.password + ' ' +typeof loginAttempt.username);
    var query  = User.where({name: loginAttempt.username, password: loginAttempt.password});
    query.findOne(function (err, user) {
      if (err) return handleError(err);
      if (user) {
        // doc may be null if no document matched
        currentUser = loginAttempt.username;
        console.log('In');
        var html = '<head><title>Success!</title></head>' + styling +
             '<body><div id="banner"><a href=\"http://localhost:3000\">Logout</a></div>' +
             '<div id="bulk"><h1>Login Successful</h1>' +
             '<p>Welcome to my website.<br>I am working on implementing a login</p></div></body>';
        console.log(currentUser);
        res.send(html);
  }
    });
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