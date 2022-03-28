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
        let { bookId, reviewedBy, rating } = data;

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
        if (isValid(reviewedBy)) {
            res.status(400).send({ status: false, msg: "Reviewed by is mandatory" })
            return
        }
        if (isValid(rating)) {
            res.status(400).send({ status: false, msg: "Rating is mandatory" })
            return
        }
        if (isValid(rating < 1 || rating > 5)) {
            res.status(400).send({ status: false, msg: "Rating should be between 1 to 5" })
            return
        }
        const newDate = new Date();
        const reviewedAt = `${newDate.getFullYear()}/${newDate.getMonth()}/${newDate.getDate()}`;
        console.log(reviewedAt);
        data.reviewedAt = reviewedAt;
        if (isValid(reviewedAt)) {
            res.status(400).send({ status: false, msg: "ReviewedAt is mandatory" })
            return
        }
        else {
            let createdReview = await reviewModel.create(data)
            res.status(201).send({ data: createdReview })
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
        let { review, rating, reviewedBy } = data;
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
            res.status(404).send({ status: false, msg: "ReviewId not found" })
            return
        }
        if (!isValid(review)) {
            res.status(400).send({ status: false, msg: "Reviews are mandatory" })
            return
        }
        if (!isValid(rating)) {
            res.status(400).send({ status: false, msg: "Rating is required and it should be between 1 to 5" })
            return
        }
        if (!isValid(reviewedBy)) {
            res.status(400).send({ status: false, msg: "ReviewedBy is required" })
            return
        }
        let reviewIdExist = await reviewModel.findOne({ $and: [{ _id: reviewId }, { isDeleted: false }] })
        if (reviewIdExist) {
            if (reviewIdExist.bookId == bookId) {
                let bookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!bookIdExist) {
                    res.status(400).send({ status: false, msg: "Please provide correct bookId" })
                    return
                }
            } else {
                res.status(400).send({ status: false, msg: "Please provide correct reviewId and bookId that is required" })
            }
        } else {
            res.status(404).send({ status: false, msg: "Please provide correct reviewId" })
        }

        let updatedData = await reviewModel.updateMany({ _id: reviewId }, { $set: { review: review, rating: rating, reviewedBy: reviewedBy } })
        console.log(updatedData)
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
            res.status(404).send({ status: false, msg: "ReviewId not found" })
            return
        }
        let reviewIdExist = await reviewModel.findOne({ $and: [{ _id: reviewId }, { isDeleted: false }] })
        if (reviewIdExist) {
            if (reviewIdExist.bookId == bookId) {
                let bookIdExist = await bookModel.findOne({ $and: [{ _id: bookId }, { isDeleted: false }] })
                if (!bookIdExist) {
                    res.status(400).send({ status: false, msg: "Please provide correct bookId" })
                    return
                }
            } else {
                res.status(400).send({ status: false, msg: "Please provide correct reviewId and bookId that is required" })
            }
        } else {
            res.status(404).send({ status: false, msg: "Please provide correct reviewId" })
        }
        let deleteUpdate = await reviewModel.findOneAndUpdate({ _id: reviewId }, { isDeleted: true })

        if (deleteUpdate) {
            await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })
        }
        res.status(400).send({ status: true, message: "blog successfully deleted" })
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