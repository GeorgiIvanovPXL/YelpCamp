const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect()

const reviewSchema = new Schema({
    body: {
        type: String
    },
    rating:{
        type: Number
    }



});

module.exports = mongoose.model("Review", reviewSchema);