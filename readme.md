# Add Mongoose
* Install and configure Mongoose
* Setup campground model
* Use campground model inside of our routes

# Show Page
* Review the RESTful routes we've seen so far
* Add description to ur campground model
* Add a show route/template


# RESTFUL Routes
* No.  name      url         verb     description
* ==========================================
* 1.   INDEX     /dogs       GET      Display a list of all dogs
* 2.   NEW       /dogs/new   GET      Displays for to make a new dog
* 3.   CREATE    /dogs       POST     Add new dog to DB
* 4.   SHOW      /dogs/:id   GET      Shows info about one dog
* 5.   EDIT      
* 6.   UPDATE
* 7.   DELETE

# Note: NEW Route needs to be mentioned before the SHOW route. 

# Refactor Mongoose Code
* Create a models directory
* Use module.exports 
* Require everything correctly!

# Add Seeds File
* Add a seeds.js file
* Run the seeds file every time the server starts

# Add the comment model
* Make our errors go away
* Display comments on campground show page

# Comment New/Create
* Discuss nested routes
* Add the comment new and create routes
* Add the new comment form

# NESTED ROUTES

       INDEX     /campgrounds
       NEW       /campgrounds/new
       CREATE    /campgrounds
       SHOW      /campgrounds/:id

       NEW       /campgrounds/:id/comments/new    GET  
       CREATE    /campgrounds/:id/comments        POST

# Style Show Page
* Add sidebar to show page
* Display comments nicely

# Finish Styling Show Page
* Add public directory
* Add custom stylesheet

## Auth Pt. 1 - Add User Model
* Install all packages needed for authentication
* Define user model

## Auth Pt .2 - Register
* Configure Passport
* Add register routes
* Add register template

## Auth Pt. 3 - Login
* Add login routes
* Add login template

## Auth Pt. 4 - Logout/Navbar
* Add logout route
* Prevent user from adding a comment if not signed in 
* Add links to navbar

## Auth Pt. 5 - Show/Hide Links
* Show/hide auth links in navbar correctly

## Refactor the routes
* Use express router to re-organize all routes

## Users + Comments
* Associate users and comments
* Save author's name to a comment automatically

## User + Campgrounds
* Prevent an unauthenticated user from creating a campground
* Save username+id to newly created campground

## Editing Campgrounds
* Add Method-Override
* Add Edit Route for Campgrounds
* Add Link to Edit Page
* Add Update Route

## Deleting Campgrounds
* Add Destroy Route
* Add Delete Button 

## Authorization Part 1: Campgrounds
* User can only edit his/her campgrounds
* User can only delete his/her campgrounds
* Hide/Show edit and delete buttons

## Editing Comments
* Add Edit route for comments
* Add Edit button
* Add Update route

Campground Edit Route: <!--/campgrounds/:id/edit-->
Comment Edit Route: <!--/campgrounds/:id/comments/:comment_id/edit-->

## Deleting Comments
* Add Destroy Route
* Add Delete Button

Campground Destroy Route: /campgrounds/:id
Comment Destory Route: /camgrounds/:id/comments/comment_id

## Authorization Part 2: Comments
* User can only edit his/her comments
* User can only delete his/her comments
* Hide/Show edit and delete buttons
* Refactor Middleware

## Adding in Flash!
* Demo working version
* Install and configure connect-flash
* Add bootstrap alerts to header

 * BOOTSTRAP NAV COLLAPSE JS
 * Flash Messages 
 * Refactor container div to header
 * Show/hide delete and update buttons
 * Style login/register forms
 * Random Background Landing Page
 * Refactor middleware
 * Change styling in show template - comment delete/update
 * UPDATE/DELETE CAMPGROUND

RESTFUL ROUTES

name        url         verb        description
=================================================================
INDEX       /dogs       GET         Display a list of all dogs
NEW         /dogs/new   GET         Displays form to make a new dog
CREATE      /dogs       POST        Add new dog to DB
SHOW        /dogs/:id   GET         Show info about one dog

INDEX       /campgrounds
NEW         /campgrounds/new
CREATE      /campgrounds
SHOW        /campgrounds/:id

NEW         campgrounds/:id/comments/new          GET
CREATE      campgrounds/:id/comments              POST




