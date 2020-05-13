var express    = require("express"), 
    router     = express.Router({mergeParams: true}),
    Campground = require("../models/campground"),
    Comment    = require("../models/comment"),
    middleware = require("../middleware");

// NEW COMMENT ROUTE
router.get('/new', middleware.isLoggedIn ,function(req, res) {
    // Find campground by id
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Something went wrong!");
        } else {
            // Render page for new comment
            res.render("comments/new", {campground: foundCampground}); 
        }
    });
});

// CREATE COMMENT ROUTE
router.post('/', middleware.isLoggedIn, function(req, res) {
    // Lookup campground using ID
    Campground.findById(req.params.id, function(err, foundCampground) {
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
                comment = {
                    text: req.body.comment.text,
                    author: {
                        id: req.user._id,
                        username: req.user.username
                    } 
                }
            // Create new comment
            Comment.create(comment, function(err, comment) {
                if(err || !comment) {
                    req.flash("error", "Something went wrong!");
                    console.log(err);
                } else {
                    //add username and id to comment
                    // Connect new comment to campground
                    foundCampground.comments.push(comment);
                    foundCampground.save();
                    // Redirect to campground show page
                    req.flash("success", "Successfully added a new comment");
                    res.redirect("/campgrounds/" + foundCampground._id);
                }
            });
        }
    });
});

// EDIT COMMENT ROUTE
router.get("/:commentId/edit", middleware.checkCommentOwnership, (req, res) => {
        Campground.findById(req.params.id, (err, foundCampground) => {
            if(err || !foundCampground) {
                console.log(err);
                req.flash("error", "Campground not found!");
                res.redirect("back");
            } else {
                Comment.findById(req.params.commentId, (err, foundComment) => {
                    if(err || !foundComment) {
                        console.log(err);
                        req.flash("error", "Something went wrong!");
                        res.redirect("/campgrounds/" + req.params.id);
                    } else {
                        res.render("comments/edit", {campground: foundCampground, comment: foundComment});
                    }
                });
            }
        }); 
    // /campgrounds/" + req.params.id + "/comments/" + req.params.commentId + "/edit
});

// UPDATE COMMENT ROUTE
router.put("/:commentId", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {    
            Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, (err, foundComment) => {
                if(err || !foundComment) {
                    console.log(err);
                    req.flash("error", "Comment not found!");
                    res.redirect("/campgrounds/" + req.params.id);
                } else {
                    req.flash("success", "Successfully updated comment!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
});

// DELETE COMMENT ROUTE
router.delete("/:commentId", middleware.checkCommentOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            Comment.findByIdAndDelete(req.params.commentId , (err, foundComment) => {
                if(err || !foundComment) {
                    console.log(err);
                    req.flash("error", "Something went wrong!");
                    res.redirect("/campgrounds/" + req.params.id);
                } else {
                    req.flash("success", "Successfully deleted comment!");
                    res.redirect("/campgrounds/" + req.params.id);
                }
            });
        }
    });
})

module.exports = router;
