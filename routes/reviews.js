const express = require('express');
const router = express.Router({mergeParams: true});
const reviews = require('../controllers/reviews');
const Campground = require('../models/campground');
const Review = require('../models/review')
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
// const ExpressError = require('../utilities/ExpressError');
const catchAsync = require('../utilities/catchAsync');



// REVIEWS ROUTES

router.post('/', isLoggedIn, validateReview ,catchAsync(reviews.createReview))


router.delete('/:reviewId', isLoggedIn, isReviewAuthor,  catchAsync(reviews.deleteReview))

module.exports = router;