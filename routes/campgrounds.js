var express      = require("express"),
    router       = express.Router(),
    Campground   = require("../models/campground"),
    middleware   = require("../middleware"), // Requiring only the directory automatically requires its index.js file
    NodeGeoCoder = require("node-geocoder"),
    User         = require("../models/user"),
    multer       = require("multer"),
    storage      = multer.diskStorage({
        filename: function(req, file, callback) {
            callback(null, Date.now() + file.originalname);
        }
    });

var options = {
    provider: "google",
    httpAdapter: "https",
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

var geocoder = NodeGeoCoder(options);

var imageFilter = function (req, file, cb) {
    //accept image files only
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
};
var upload = multer({storage: storage, fileFilter: imageFilter})

var cloudinary = require("cloudinary");
cloudinary.config({
    cloud_name: "rishabh0009",
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - Show all campgrounds
router.get("/", function(req, res) {
    if(req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        // Get all campgrounds from DB
        Campground.find({name: regex}, function(err, allCampgrounds) {
            if(err) {
                console.log(err);
                req.flash("error", "Something went wrong");
                res.redirect("back");
            } else {
                if(allCampgrounds.length < 1) {
                    return res.render("campgrounds/index", {campgrounds: [], error:"No campgrounds match that query. Please try again!"});
                }
                res.render("campgrounds/index", {campgrounds:allCampgrounds});
            }
        });
    } else {
        //Get all campgrounds from DB
        Campground.find({}, function(err, allCampgrounds) {
            if(err) {
                console.log(err);
            } else {
                res.render("campgrounds/index", {campgrounds:allCampgrounds});
            }
        });
    }
});

//NEW - Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req, res) {
    res.render("campgrounds/new");
});

// CREATE - Add new campground to DB
router.post("/", middleware.isLoggedIn, upload.single("image"), function(req, res) {
    geocoder.geocode(req.body.location, function(err, data) {
        if(err || !data.length) {
            console.log(err);
            req.flash("error", "Invalid address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        
        cloudinary.v2.uploader.upload(req.file.path, function(err, result) {
            if(err) {
                req.flash("error", "Something went wrong. Could not upload the image.");
                return res.redirect("back");
            }
            // Add cloudinary url for the image to the campground object under image property
            req.body.campground.image = result.secure_url;
            // Add image's public_id to campground object
            req.body.campground.imageId = result.public_id;
            //Add author to campground
            req.body.campground.author = {
                id: req.user._id,
                username: req.user.username
            }
            //Create a new campground and save to DB
            Campground.create(req.body.campground, function(err, newlyCreated) {
                if(err || !newlyCreated) {
                    console.log(err);
                    req.flash("error", err.message);
                    return res.redirect("back");
                } 
                req.flash("success", "Successfully created new Campground!");
                res.redirect("/campgrounds/" + newlyCreated._id);
            });
        });
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
            User.findById(foundCampground.author.id, (err, foundAuthor) => {
                res.render("campgrounds/show", {campground: foundCampground, user: foundAuthor});
            });
            //console.log(foundCampground);
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
router.put("/:id", middleware.checkCampgroundOwnership, upload.single("image"), function(req, res) {
    //var file = req.file;
    //eval(require("locus"));
     geocoder.geocode(req.body.location, function(err, data) {
        if(err || !data.length) {
            req.flash("error", "Invalid Address");
            return res.redirect("back");
        }
        req.body.campground.lat = data[0].latitude;
        req.body.campground.lng = data[0].longitude;
        req.body.campground.location = data[0].formattedAddress;
        
        Campground.findById(req.params.id, async function(err, campground) {
            if(err || !campground) {
                console.log(err.message);
                req.flash("error", "Campground not found");
                res.redirect("back");
            } else {
                if(req.file) {
                    try {
                        await cloudinary.v2.uploader.destroy(campground.imageId);
                        var result = await cloudinary.v2.uploader.upload(req.file.path);
                        // Add cloudinary url for the image to the campground object under image property
                        req.body.campground.image = result.secure_url;
                        // Add image's public_id to campground object
                        req.body.campground.imageId = result.public_id;
                        //Add author to campground
                        req.body.campground.author = {
                            id: req.user._id,
                            username: req.user.username
                        } 
                    } catch(err) {
                        console.log(err.message);
                        req.flash("error", err.message);
                        return res.redirect("back");
                    }
                }
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
            }
        });  
    });
});

// DESTROY CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res) => {
    Campground.findById(req.params.id, async function(err, campground) {
        if(err) {
            console.log(err);
            req.flash("error", "Campground not found");
            return res.redirect("back");
        }
        try {
            await cloudinary.v2.uploader.destroy(campground.imageId);
            campground.remove();
            req.flash("success", "Campground successfully deleted");
            res.redirect("/campgrounds");
        } catch(err) {
            console.log(err);
            req.flash("error", "There was an issue with deleting the campground image.");
            return res.redirect("back");
        }
    });
});

function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

module.exports = router; 