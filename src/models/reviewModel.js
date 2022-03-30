// ----------------------------------------------------------------------------------------- //
// Require Packages

const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const newDate = new Date();

// ------------------------------------------------------------------------------------------- //
// Create Schema

const reviewSchema = new mongoose.Schema({
    bookId: {
        type: ObjectId,
        required: "Book Id is required",
        ref: "Books"
    },
    reviewedBy: {
        type: String,
        required: "ReviewedBy is required",
        default: "Guest",
        trim: true
    },
    rating: {
        type: Number,
        required: "Rating is required"
    },
    review: {
        type: String,
        trim: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    reviewedAt: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// ---------------------------------------------------------------------------------------------- //
// Exports

module.exports = mongoose.model("Review", reviewSchema);