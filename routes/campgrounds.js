var express = require("express"),
    router  = express.Router(),
    Campground = require("../models/campground"),
    middleware = require("../middleware"); // Requiring only the directory automatically requires its index.js file
    
//INDEX - Show all campgrounds
router.get("/", function(req, res) {
    //Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds) {
        if(err) {
            console.log(err);
            req.flash("error", "Something went wrong!");
        } else {
            res.render("campgrounds/index", {campgrounds:allCampgrounds});
        }
    });
});

//NEW - Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// CREATE - Add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var price = req.body.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newCampground = {name: name, price: price, image: image, description: description, author: author};
    
    //Create a new campground and save to DB

    Campground.create(newCampground, function(err, newlyCreated) {
        if(err || !newlyCreated) {
            console.log(err);
            req.flash("error", "Something went wrong!");
        } else {
            req.flash("success", "Successfully created new Campground!");
            res.redirect("/campgrounds");
        }
    });
});

//SHOW - Shows more info about one campground
router.get("/:id", function(req, res) {
    // Find the campground with the provided ID
    Campground.findById(req.params.id).populate("comments").exec (function(err, foundCampground) {
        if(err || !foundCampground) {
            console.log("\n-------------------------This is the error from DB Fetch--------------");
            console.log(err);
            console.log("------------------------------------------------------------------------");
            req.flash("error", "Campground not found!");
            res.redirect("back");
        } else {
            //console.log(foundCampground);
            res.render("campgrounds/show", {campground: foundCampground});
        }
    }); 
    // Render show template with that campground
});

// EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, (err, foundCampground) => {
        if(err || !foundCampground) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
        
    });
});

// UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground) => {
        if(err || !updatedCampground) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Successfully updated campground!");
            res.redirect("/campgrounds/" + updatedCampground._id);
        }
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findByIdAndDelete(req.params.id, (err, foundCampground) => {
        if (err || !foundCampground) {
            console.log(err);
            req.flash("error", "Something went wrong!");
            res.redirect("/campgrounds/" + req.params.id);
        } else {
            req.flash("success", "Successfully deleted campground!");
            res.redirect("/campgrounds");
        }
    });
});

module.exports = router; 