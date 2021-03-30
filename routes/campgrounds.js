const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utilities/catchAsync');
const Campground = require('../models/campground');

const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');




// ______ANOTHER WAY OF STRUCTURING ROUTES______

// router.route('/')
// .get(catchAsync(campgrounds.index))
// .post(isLoggedIn , validateCampground , catchAsync(campgrounds.createCampground));

// router.route('/:id')
// .get(catchAsync(campgrounds.showCampground))
// .put(isLoggedIn , isAuthor , validateCampground, catchAsync(campgrounds.updateCampground))
// .delete(isLoggedIn ,isAuthor, catchAsync(campgrounds.destroyCampground));

// ______ANOTHER WAY OF STRUCTURING ROUTES______



// INDEX OF CAMPGROUNDS ==> SHOWS ALL CAMPGROUNDS

router.get('/',  catchAsync(campgrounds.index))
 
 // RENDER NEW FORM AND CREATE NEW CAMPGROUND (POST)
 
 router.get('/new', isLoggedIn , campgrounds.renderNewForm)
 
 router.post('/',isLoggedIn , validateCampground , catchAsync(campgrounds.createCampground));


 // SHOW SINGLE CAMPGROUND
 
 router.get('/:id', catchAsync(campgrounds.showCampground));
 
 // SERVE EDIT FORM AND UPDATE RECORD IN DB
 
 router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
 
 router.put('/:id',isLoggedIn , isAuthor , validateCampground, catchAsync(campgrounds.updateCampground));
 
 // DELETE A CAMPGROUND
 
 router.delete('/:id',isLoggedIn ,isAuthor, catchAsync(campgrounds.destroyCampground));
 
 module.exports = router;