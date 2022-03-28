// ------------------------------------------------------------------------------------ //
// Require Packages

const mongoose = require("mongoose");
const moment = require("moment");
const ObjectId = mongoose.Schema.Types.ObjectId;
const newDate = new Date();

// -------------------------------------------------------------------------------------- //
// Create Schema

const bookSchema = new mongoose.Schema ({
    title: {
        type: String,
        required: "Title is required",
        unique: true,
        trim: true
    },
    excerpt: {
        type: String,
        required: "Short summary is required",
        trim: true
    },
    userId: {
        type: ObjectId,
        required: "UserId is required",
        ref: "User"
    },
    ISBN: {
        type: String,
        required: "ISBN number is required",
        unique: true,
        trim: true
    },
    category: {
        type: String,
        required: "Category is required",
        trim: true
    },
    subCategory: {
        type: String,
        required: "subCategory is required",
        trim: true
    },
    reviews: {
        type: Number,
        default: 0
    },
    deletedAt: {
        type: Date,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,
        default: `${newDate.getFullYear()}/${newDate.getMonth()}/${newDate.getDate()}`
    }
}, { timestamps: true });


// ------------------------------------------------------------------------------------ //
// Exports

module.exports = mongoose.model("Books", bookSchema);