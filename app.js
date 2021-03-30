const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utilities/ExpressError');
const methodOverride = require('method-override');
const User = require('./models/user');
const passport = require('passport');
const LocalStrategy = require('passport-local');

require('dotenv').config({ path: path.resolve(__dirname, './.env') });
const app = express();


const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users');





mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});



// // CONNECT TO MONGO

// let pwd = process.env.MONGOPASSWORD;

// const MONGO_URI = `mongodb+srv://desktopper:${pwd}@cluster0.fqkiu.mongodb.net/YelpCampDB?retryWrites=true&w=majority`

// // CONNECTION TO MONGOOSE
// mongoose.connect(MONGO_URI,{
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
// }).then(() => console.log('DB CONNECTED'))
// .catch(err => console.log(err));


// mongoose.connection.on('connected',() =>{
//     console.log('Connected to Atlas Cluster (MongoDB)...');
// });
// mongoose.connection.on('error', console.error.bind(console, 'Connection ERROR'));


app.use(express.urlencoded({
    extended:true
}));
app.engine('ejs', ejsMate)
app.set('view engine','ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))
app.use('/img', express.static(__dirname + 'public/img'));
app.use('/css', express.static(__dirname + 'public/css'));
app.use('/js', express.static(__dirname + 'public/js'));
const sessionConfig ={
    secret: 'HKJHKUHLUYuihgoiuyhoiuhLIUHLUIhoiuhm54685kjhiuyhuih',
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()))

// HOW TO SERIALIZE A USER (STORE USER IN THE SESSION)
passport.serializeUser(User.serializeUser())
// DELETE USER FROM THE SESSION
passport.deserializeUser(User.deserializeUser())


app.use((req,res, next) =>{
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
 })

app.use(methodOverride('_method'));

//USER ROUTES

app.use('/', userRoutes)

// CAMPGROUND ROUTES

app.use('/campgrounds', campgroundRoutes)

// REVIEW ROUTES

app.use('/campgrounds/:id/reviews', reviewRoutes)

// GET home.ejs

app.get('/', (req, res) =>{
    res.render('home')
})

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