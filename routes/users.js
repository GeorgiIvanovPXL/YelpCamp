const express = require('express');
const router = express.Router();
const User = require('../models//user');
const passport = require('passport');
const catchAsync = require('../utilities/catchAsync');
const users = require('../controllers/users');


router.get('/register', users.renderRegisterForm);

router.post('/register',  catchAsync(users.registerUser));

router.get('/login', users.renderLoginForm);

router.post('/login', passport.authenticate('local',{failureFlash: true, failureRedirect: '/login'}), users.logUserIn);

router.get('/logout', users.logUserOut);

module.exports = router;