const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');
const Campground = require('../models/campground');
require('../node_modules/dotenv').config();


// CONNECTION TO MONGOOSE

let pwd = process.env.MONGOPASSWORD

const MONGO_URI = `mongodb+srv://desktopper:${'desktopper123'}@cluster0.fqkiu.mongodb.net/YelpCampDB?retryWrites=true&w=majority`

// CONNECTION TO MONGOOSE
mongoose.connect(MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
})



const db = mongoose.connection;

db.on("error", console.error.bind(console, 'connection error: '));
db.once('open', () =>{
    console.log('CONNECTED TO DATABASE');
});

// FUNCTION FOR RANDOMLY CHOOSING DESCRIPTORS AND PLACES FROM seedHelper.js


const sample = (array) => array[Math.floor(Math.random() * array.length)]


// SEED FUNCTION

const seedDB = async () =>{
await Campground.deleteMany({});
for(let i =0; i< 50;i++){
    const random1000 = Math.floor(Math.random() * 1000 );
    const price = Math.floor(Math.random() * 20 ) + 10;
    const camp = new Campground({
        location: `${cities[random1000].city}, ${cities[random1000].state}`,
        title: `${sample(descriptors)} ${sample(places)}`,
        image: `https://source.unsplash.com/random/800x500?sig=${i}`,
        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ratione hic voluptatibus sed ullam libero a fugiat rerum voluptatem pariatur natus numquam laboriosam amet dolorem at, ducimus vitae aspernatur laudantium esse.',
        price
    })
    await camp.save();
}

}

seedDB().then(() =>{
    mongoose.connection.close();
});