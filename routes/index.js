var express    = require("express"),
    router     = express.Router(),
    passport   = require("passport"),
    User       = require("../models/user"),
    Campground = require("../models/campground"),
    async      = require("async");
    nodemailer = require("nodemailer"),
    crypto     = require("crypto");
    
// Root route
router.get("/", function(req, res) {
    res.render("landing");
});

// Show register form
router.get("/register", (req, res) => {
    res.render("register", {page: "register"});
});

// Handle Sign Up Logic
router.post("/register", (req, res) => {
    var newUser = new User({
        username: req.body.username,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        avatar: req.body.avatar
    });
    
    if(req.body.adminCode === process.env.ADMINCODE) {
        newUser.isAdmin = true;
    }

    //console.log(req.body.account, newUser);
    //eval(require("locus"));

    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err.message);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Successfully Signed Up! Welcome to Yelpcamp " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", (req, res) => {
    res.render("login", {page: "login"});
});

// Handle Sign In Logic
router.post("/login", passport.authenticate("local", {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
}), (req, res) => {
});

// Logout Route
router.get("/logout", (req, res) => {
    req.logout();
    req.flash("success", "Logged you out!");
    res.redirect("/campgrounds");
});

// FORGOT PASSWORD ROUTES
router.get("/forgot", (req, res, next) => {
    res.render("forgot");
});

router.post("/forgot", (req, res, next) => {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({email: req.body.email}, function(err, user) {
                if(!user) {
                    req.flash("error", "No account with that email address exists");
                    return res.redirect("/forgot");
                }
                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; //1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'yelpcampprojectrishabh@gmail.com',
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'yelpcampprojectrishabh@gmail.com',
                subject: 'YelpCamp Password Reset',
                text: 'You are receiving this message because you (or someone else) have requested the reset of the password for your account. \n\n' + 'Please click on the following link, or paste this into your browser to complete the process. \n\n' + 'http://' + req.headers.host + '/reset/' + token + '\n\n' + 'If you did not request this, please ignore this email and your password will remain unchanged. \n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                console.log("mail sent");
                req.flash("success", "An e-mail has been sent to " + user.email + ' with further instructions');
                done(err, 'done');
            });
        }
    ], function(err) {
        if(err) {
            return next(err);
        }
        res.redirect("/forgot");
    });
});

router.get("/reset/:token", function(req, res) {
    User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: {$gt: Date.now()}
    }, function(err, user) {
        if(!user) {
            req.flash("error", "Password reset token is invalid or has expired");
            return res.redirect("/forgot");
        }
        res.render("reset", {token: req.params.token});
    });
});

router.post("/reset/:token", function(req, res) {
    async.waterfall([
        function(done) {
            User.findOne({
                resetPasswordToken: req.params.token, 
                resetPasswordExpires: {$gt: Date.now()}
            }, function(err, user) {
                if(!user) {
                    req.flash("error", "Password reset token is invalid or has expired");
                    return res.redirect("back");
                }
                if(req.body.password === req.body.confirm) {
                    user.setPassword(req.body.password, function(err) {
                        user.resetPasswordToken = undefined;
                        user.resetPasswordExpires = undefined;

                        user.save(function(err) {
                            req.logIn(user, function(err) {
                                done(err, user);                            
                            });
                        });
                    });
                } else {
                    req.flash("error", "Passwords do not match");
                    return res.redirect("back");
                }
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "yelpcampprojectrishabh@gmail.com",
                    pass: process.env.GMAILPW
                }
            });
            var mailOptions = {
                to: user.email,
                from: "yelpcampprojectrishabh@gmail.com",
                subject: "Your password has been changed",
                text: "Hello, \n\n" + "This is a confirmation that the password for your account " + user.email + " has just been changed.\n"
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash("success", "Success! Your password has been changed");
                done(err);
            });
        }
    ], function(err) {
        res.redirect("/campgrounds");
    });
});

// USER PROFILES
router.get("/users/:id", (req, res) => {
    User.findById(req.params.id, (err, foundUser) => {
        //console.log(foundUser);
        if(err || !foundUser) {
            console.log(err);
            req.flash("error", "The user could not be found");
            return res.redirect("back");
        }
        Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds) => {
            //console.log(campgrounds);
            if(err || !campgrounds) {
                console.log(err);
                req.flash("error", "No campgrounds found by that user");
                return res.redirect("back");
            } 
            res.render("users/show", {user: foundUser, campgrounds: campgrounds});
        });
    });
});

module.exports = router;