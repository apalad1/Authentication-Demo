var express = require("express");
var mongoose = require("mongoose");
var passport = require("passport");
var bodyParser = require("body-parser");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
//all the required npm packages ^, except 'User'
//also requires ejs npm package 

mongoose.connect("mongodb://localhost/authdemo"); //authdemo is the db name in mongodb

var app = express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(require("express-session")({
	secret: "rusty dog",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//routes *******************************************************************

app.get("/", function(req, res){
	res.render("home");
});

//need the isLoggedIn to stop the user from typing /secret on url to access secret
app.get("/secret", isLoggedIn, function(req, res){
	res.render("secret");
});

app.get("/register", function(req, res){
	res.render("register");
});

app.post("/register", function(req, res){
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err){
            console.log(err);
            return res.render('register');
        }
        passport.authenticate("local")(req, res, function(){
           res.redirect("/secret");
        });
    });
});


app.get("/login", function(req, res){
   res.render("login"); 
});

//login authentication logic


app.post("/login", passport.authenticate("local", {
    successRedirect: "/secret",
    failureRedirect: "/login"
}) ,function(req, res){
});

app.get("/logout", function(req, res){
	req.logout();
	res.redirect("/");
});

function isLoggedIn(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	res.redirect("login");
}

//SERVER CONNECTION *********************************************************************
app.listen(3000, () => {
    console.log("server is running");
});
