const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const Review = require('./models/review')
const ejsMate = require('ejs-mate');
const {campgroundSchema, reviewSchema} = require('./schemas');
const catchAsync = require('./utilities/catchAsync');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const nodemailer = require('nodemailer');
require('dotenv').config();


const makeEmail = function (name){
    // EMAIL STEP 1
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth:{
            user:process.env.EMAIL,
            pass:process.env.PASSWORD
        }
    });
    
    // EMAIL STEP 2
    
    let mailOptions ={
        from: 'aestheticbeast345@gmail.com',
        to: 'perfectwebpresence@gmail.com',
        subject: 'News YelpCamp',
        text: `New Campground Added: ${name}`
    }
    
    // EMAIL STEP 3
    
    transporter.sendMail(mailOptions, (err, data) =>{
        if(err){
            console.log(`ERROR`)
        }else{
            console.log(`SUCCESS`)
        }
        
    
    })
}


let pwd = process.env.MONGOPASSWORD;

const MONGO_URI = `mongodb+srv://desktopper:${pwd}@cluster0.fqkiu.mongodb.net/YelpCampDB?retryWrites=true&w=majority`

// CONNECTION TO MONGOOSE
mongoose.connect(MONGO_URI,{
    useNewUrlParser: true,
    
    useUnifiedTopology: true,
})



mongoose.connection.on('connected',() =>{
    console.log('Connected to Atlas Cluster (MongoDB)...');
});
mongoose.connection.on('error', console.error.bind(console, 'Connection ERROR'));


app.engine('ejs', ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));

app.use(express.urlencoded({
    extended:true
}));
app.use(methodOverride('_method'));


const validateCampground = (req,res,next) => {
     //JOI SCHEMA VALIDATION

    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    }
    else{
        next();
    }

}


const validateReview = (req, res, next) =>{
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }else{
        next();
    }
}



// CAMPGROUNDS ROUTES

// GET home.ejs

app.get('/', (req, res) =>{
    res.render('home')
})

// INDEX OF CAMPGROUNDS ==> SHOWS ALL CAMPGROUNDS

app.get('/campgrounds', async (req,res) => {
   const campgrounds = await Campground.find({});
   res.render('campgrounds/index',{campgrounds})
})

// SERVE NEW FORM AND CREATE NEW CAMPGROUND (POST)

app.get('/campgrounds/new',(req,res) =>{
    res.render('campgrounds/new')
})

app.post('/campgrounds', validateCampground , catchAsync(async (req,res,next) =>{
    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    const campground = new Campground(req.body.campground);
    await campground.save();
    makeEmail(campground.title);
    res.redirect(`/campgrounds/${campground._id}`);
}));

// SHOW SINGLE CAMPGROUND

app.get('/campgrounds/:id', catchAsync(async (req,res) =>{
   
    const {id} = req.params;
    const campground = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', {campground})

}));

// SERVE EDIT FORM AND UPDATE RECORD IN DB

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/edit', {campground})
}));

app.put('/campgrounds/:id', validateCampground, catchAsync( async (req, res) =>{
    const {id} = req.params;
   const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
   res.redirect(`/campgrounds/${campground._id}`)
}));

// DELETE A CAMPGROUND

app.delete('/campgrounds/:id', catchAsync(async (req, res) =>{
    const {id} = req.params;
    const deletedProduct = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));




// REVIEWS ROUTES



app.post('/campgrounds/:id/reviews', validateReview ,catchAsync(async(req,res) =>{

    // res.send('You made it!')
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    // TEST log when a new review is created
    console.log(review)
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);

}))


app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async(req, res)=>{
    const {id, reviewId} = req.params;
    const campground = await Campground.findByIdAndUpdate(id,{$pull: {reviews: reviewId}});
    const review = await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${campground._id}`)

}))




app.all('*',(req,res,next) =>{
    next(new ExpressError('Page not found!',404));
})

// ERROR HANDLER

app.use((err,req,res,next) =>{
    const {statusCode = 500, message = 'SWW'} = err;
    if(!err.message){
        err.message = 'Oh no, something went wrong!'
    } 
    res.status(statusCode).render('error',{ err });
})


app.listen(3000, () =>{
    console.log('LISTENING ON PORT 3000')
})