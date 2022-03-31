// --------------------------------------------------------------------------------------- //
// Require Packages

const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const reviewModel = require("../models/reviewModel");
const moment = require("moment");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// ------------------------------------------------------------------------------------------- //
// Validation Formatting

const isValid = function (value) {
    if (typeof value === "undefined" || value === "null") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId)
}

// ---------------------------------------------------------------------------------------- //
// Create Review

const createReviews = async function (req, res) {
    try {
        let data = req.body;
        // let bookId = req.params.bookId;
        let { reviewedBy, rating, reviewedAt, review, bookId } = data;  //destructure

        if (Object.keys(data).length == 0) {
            res.status(400).send({ status: false, msg: "BAD REQUEST" })
            return
        }
        if (!isValid(bookId)) {
            res.status(400).send({ status: false, msg: "BookId is mandatory" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(404).send({ status: false, msg: "Invalid Book Id" })
            return
        }
        if (!isValid(reviewedBy)) {
            res.status(400).send({ status: false, msg: "Reviewed by is mandatory" })
            return
        }
        if (!isValid(rating)) {
            res.status(400).send({ status: false, msg: "Rating is mandatory" })
            return
        }
        if (!isValid(rating < 1 || rating > 5)) {
            res.status(400).send({ status: false, msg: "Rating should be between 1 to 5" })
            return
        }
        if (!isValid(reviewedAt)) {
            res.status(400).send({ status: false, msg: "ReviewedAt is mandatory" })
            return
        }
        if (!isValid(review)) {
            res.status(400).send({ status: false, msg: "Review is mandatory" })
            return
        }
        else {
            let createdReview = await reviewModel.create(data)
            res.status(201).send({ status: true, msg: "Reviews created successfully", data: createdReview })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};

// ------------------------------------------------------------------------------------- // 
// Update Reviews

const updateReviews = async function (req, res) {
    try {
        let data = req.body;
        let { review, rating, reviewedBy } = data;  // Destructure
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        const finalFilter = {};

        if (!isValid(bookId)) {
            res.status(400).send({ status: false, msg: "BookId not found" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(404).send({ status: false, msg: "BookId is Invalid" })
            return
        }
        if (!isValid(reviewId)) {
            res.status(400).send({ status: false, msg: "ReviewId not found" })
            return
        }
        if (!isValidObjectId(reviewId)) {
            res.status(404).send({ status: false, msg: "ReviewId is Invalid" })
            return
        }
        if (isValid(review)) {
            finalFilter["review"] = review
        }
        if (isValid(rating)) {
            finalFilter["rating"] = rating
        }
        if (isValid(reviewedBy)) {
            finalFilter["reviewedBy"] = reviewedBy
        }
        let reviewIdExist = await reviewModel.findOne({ $and: [{ _id: reviewId }, { isDeleted: false }] })
        if (isValid(reviewIdExist)) {
            if (reviewIdExist.bookId == bookId) {
                let bookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isValid(bookIdExist)) {
                    res.status(400).send({ status: false, msg: "Please provide correct bookId" })
                    return
                }
            } else {
                res.status(400).send({ status: false, msg: "Please provide correct reviewId and bookId that is required" })
            }
        } else {
            res.status(404).send({ status: false, msg: "Please provide correct reviewId" })
        }

        let updatedData = await reviewModel.updateMany({ _id: reviewId }, { $set: finalFilter })
        console.log(updatedData)
        const updatedReview = await reviewModel.findById(reviewId)
        res.status(200).send({ status: true, msg: "Successfully updated", data: updatedReview })
        return

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};


// -------------------------------------------------------------------------------------- //
// Delete Reviews

const deleteReviews = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let reviewId = req.params.reviewId;

        if (!isValid(bookId)) {
            res.status(400).send({ status: false, msg: "BookId not found" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(404).send({ status: false, msg: "BookId is Invalid" })
            return
        }
        if (!isValid(reviewId)) {
            res.status(400).send({ status: false, msg: "ReviewId not found" })
            return
        }
        if (!isValidObjectId(reviewId)) {
            res.status(404).send({ status: false, msg: "ReviewId is Invalid" })
            return
        }
        let reviewIdExist = await reviewModel.findById(reviewId)

        if (isValid(reviewIdExist)) {
            if (reviewIdExist.isDeleted === true) {
                res.status(400).send({ status: false, msg: "Review Already Deleted" })
                return
            }
            if (reviewIdExist.bookId == bookId) {
                let bookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!isValid(bookIdExist)) {
                    res.status(400).send({ status: false, msg: "Please provide correct bookId" })
                    return
                }
            } else {
                res.status(400).send({ status: false, msg: "Please provide correct reviewId and bookId that is related" })
                return
            }
        } else {
            res.status(400).send({ status: false, msg: "Please provide correct reviewId" })
            return
        }
        let updateDeleted = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })

        if (isValid(updateDeleted)) {
            await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }
        res.status(200).send({ status: true, msg: "Successfully Deleted", data: updateDeleted })
        return

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};


// ------------------------------------------------------------------------------------ //
// Exorts

module.exports.createReviews = createReviews;
module.exports.updateReviews = updateReviews;
module.exports.deleteReviews = deleteReviews;