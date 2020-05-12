var express = require("express"),
    router  = express.Router(),
    passport = require("passport"),
    User = require("../models/user");

// Root route
router.get("/", function(req, res) {
    res.render("landing");
});

// Show register form
router.get("/register", (req, res) => {
    res.render("register");
});

// Handle Sign Up Logic
router.post("/register", (req, res) => {
    var newUser = new User({username: req.body.username});
    User.register(newUser, req.body.password, (err, user) => {
        if(err) {
            console.log(err.message);
            req.flash("error", err.message);
            return res.redirect("/register");
        }
        passport.authenticate("local")(req, res, () => {
            req.flash("success", "Registration complete. Welcome to Yelpcamp: " + user.username);
            res.redirect("/campgrounds");
        });
    });
});

// Show login form
router.get("/login", (req, res) => {
    res.render("login");
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

module.exports = router;