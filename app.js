var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment");
    seedDB     = require("./seeds"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    User = require("./models/user");
    

//Requiring Routes
var commentRoutes    = require("./routes/comments"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");

// App Configuration
    //mongoose.connect('mongodb://localhost:27017/yelp_camp_v12', {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

mongoose.connect("mongodb+srv://rishabhranyal:1994Ranyal@mongodb-cluster-rishabh-pvdfe.mongodb.net/test?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useFindAndModify: false,
	useCreateIndex: true,
    useUnifiedTopology: true
}).then(() => {
	console.log("Connected to DB!");
}).catch(err => {
	console.log('ERROR:', err.message);
});

app.set("view engine", "ejs");
app.use(express.static(__dirname + "\\public"));
app.use(bodyParser.urlencoded({extended: true}));

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Marshal wins cutest dog again!",
    resave: false,
    saveUninitialized: false
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res, next) => {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});
app.use(methodOverride("_method"));
app.use(indexRoutes);
app.use("/campgrounds/:id/comments",commentRoutes);
app.use("/campgrounds", campgroundRoutes);

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//Seed the database
//seedDB();

/*
app.listen(3000, process.env.IP, function() {
    console.log("The YelpCamp server is running!");
});
*/

app.listen(process.env.PORT, process.env.IP, function() {
    console.log("The YelpCamp server is running!");
});
