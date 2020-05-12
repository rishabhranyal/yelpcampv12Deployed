var Campground = require("../models/campground"),
    Comment    = require("../models/comment");
// All the middleware goes here

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
        // If user logged in
        if(req.isAuthenticated()){
            Campground.findById(req.params.id, (err, foundCampground) => {
                if(err || !foundCampground) {
                    req.flash("error", "Campground not found");                    
                    res.redirect("back");
                } else {
                    //  Does user own the campground?
                    if(foundCampground.author.id.equals(req.user._id)) {
                        next();
                    } else {
                        req.flash("error", "You don't have permission to do that!");
                        res.redirect("back");
                    }
                    //if(campground.author.id === req.user._id) // This won't work because campground.author.id is an Object and not a string, whereas req.user._id is a string. 
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that!");
            res.redirect("/login");
        }
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
    if(req.isAuthenticated()) {
        // If user is logged in:
        Comment.findById(req.params.commentId, (err, foundComment) => {
            if(err || !foundComment) {
                console.log(err);
                req.flash("error", "Comment not found");
                res.redirect("back");
            } else {
                //Check if user owns the comment:
                //If yes:
                    //Then next
                if(foundComment.author.id.equals(req.user._id)) {
                    next();
                //If no: 
                    //Redirect to another page
                } else {
                    req.flash("error", "You do not have permissions for this!");
                    res.redirect("back");
                }
            }
        });
        //If user is not logged in:
    } else {
        // Redirect to login page
        req.flash("error", "You need to be logged in to do that!");
        res.redirect("back");
    }
};

middlewareObj.isLoggedIn = function (req, res, next) {
    if(req.isAuthenticated()) {
        return next();    
    }
    req.flash("error", "You need to be logged in to do that!");
    res.redirect("/login");
};

module.exports = middlewareObj;  