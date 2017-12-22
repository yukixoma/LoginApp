var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var bcrypt      = require("bcryptjs");

router.get("/register", function(req,res){
    res.render("register");
})

router.get("/login", function(req,res){
    res.render("login");
})

router.post("/register", function(req,res){
   var name         =  req.body.name;
   var email        = req.body.email;
   var username     = req.body.username;
   var password     = req.body.password;
   var password2    = req.body.password2;

   //Check Username Already Used
   User.findOne({username: username},function(err,data){
    if(err) throw err;
    if(data) {
        res.render("register", { errors: [{msg: "Username already used"}]});
    } else {
         //Validation 
        req.checkBody("name", "Name is required").notEmpty();
        req.checkBody("email", "Email is required").notEmpty();
        req.checkBody("username", "Username is required").notEmpty();
        req.checkBody("password", "Password is required").notEmpty();
        req.checkBody("email", "E-mail not valid").isEmail();
        req.checkBody("password2", "Passwords do not match").equals(req.body.password);

        var errors = req.validationErrors();

        if(errors) {
            res.render("register", {errors: errors}
        )
        } else {
            var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password,
        })
        User.createUser(newUser, function(err,user){
           if(err) throw err;
           console.log(user);
        })

        req.flash("success_msg", "You are registered and can now login");
        res.redirect("/users/login");
        }
    }
})
   
  
})

passport.serializeUser(function(user, done) {
    done(null, user);
});
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { 
            return done(err); 
        }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        bcrypt.compare(password, user.password, function(err, res) {
            if(res) return done(null, user);
            else return done(null,false, { message: 'Incorrect password.' })
        });
      });
    }
  ));

router.post("/login", 
    passport.authenticate("local", {successRedirect: '/', failureRedirect: "/users/login", failureFlash: true}), 
    function(req,res) {
        
        res.redirect("/");
    }   
)

router.get("/logout", function(req,res){
    req.logout();
    req.flash("success_msg", "You are logged out");
    res.redirect("/users/login");
})

module.exports = router;