const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geoCoder = mbxGeocoding({accessToken: mapBoxToken})


const nodemailer = require('nodemailer');

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




module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index',{campgrounds})
}

module.exports.renderNewForm = (req,res) =>{
    res.render('campgrounds/new') 
}

module.exports.createCampground = async (req,res,next) =>{

    const geoData = await geoCoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()

    // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
    
    const campground = new Campground(req.body.campground);
    campground.geometry = geoData.body.features[0].geometry;
    campground.author = req.user._id;
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully made a new campground!')
    makeEmail(campground.title);
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res) =>{
    
    const {id} = req.params;
    // CHAINING ON WITH populate to retrieve reviews (and it's author) and campground author
    const campground = await Campground.findById(id).populate({
        path: 'reviews',
        populate:{
            path: 'author'
           }
       }).populate('author');

    if(!campground){
       req.flash('error', 'Cannot find campground')
       res.redirect('/campgrounds');
   }
    res.render('campgrounds/show', {campground})

}


module.exports.renderEditForm = async (req, res) =>{
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground){
        req.flash('error', 'Cannot find campground')
        res.redirect('/campgrounds');
    }
     res.render('campgrounds/edit', {campground})
 }


module.exports.updateCampground = async (req, res) =>{
    const {id} = req.params;
   
    const campground = await Campground.findByIdAndUpdate(id,{...req.body.campground});
   
    req.flash('success', 'Successfully updated campground!')
    res.redirect(`/campgrounds/${campground._id}`)
 }

 module.exports.destroyCampground = async (req, res) =>{
    const {id} = req.params;
     const deletedCampground = await Campground.findByIdAndDelete(id);
     req.flash('success', 'Campground deleted successfully')
     res.redirect('/campgrounds');
 }