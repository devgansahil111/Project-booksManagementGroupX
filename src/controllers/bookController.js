// ------------------------------------------------------------------------------------------- //
// Require Packages

const bookModel = require("../models/bookModel");
const userModel = require("../models/userModel");
const moment = require("moment");
const mongoose = require("mongoose");
const reviewModel = require("../models/reviewModel");
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


// ------------------------------------------------------------------------------------------- //
// Create Books


const createBooks = async function (req, res) {
    try {
        let data = req.body;
        let { title, excerpt, userId, ISBN, category, subCategory, reviews } = data;

        if (Object.keys(data).length == 0) {
            res.status(400).send({ status: false, msg: "BAD REQUEST" })
            return
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, msg: "Title is mandatory" })
            return
        }
        if (!isValid(excerpt)) {
            res.status(400).send({ status: false, msg: "Short discription is required" })
            return
        }
        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "UserId is mandatory" })
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: "userId is not valid" })
            return
        }
        if (!isValid(ISBN)) {
            res.status(400).send({ status: false, msg: "ISBN is mandatory" })
            return
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, msg: "Category is mandatory" })
            return
        }
        if (!isValid(subCategory)) {
            res.status(400).send({ status: false, msg: "subCategory is mandatory" })
            return
        }

        let userDetails = await userModel.findById(userId)
        if (!userDetails) {
            res.status(404).send({ status: false, msg: "user id not exist" })
            return
        }
        const newDate = new Date();
        const releasedAt = `${newDate.getFullYear()}/${newDate.getMonth()}/${newDate.getDate()}`;
        console.log(releasedAt);
        data.releasedAt = releasedAt;
        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, msg: "Released time is mandatory" })
            return
        }
        let bookData = await bookModel.create(data);
        res.status(201).send({ status: true, msg: "Books created successfully", data: bookData })
        return;

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};

// ------------------------------------------------------------------------------------------------ //
// Get Books


const getBooks = async function (req, res) {
    try {
        let data = req.query;
        let { bookId, title, excerpt, userId, category, subCategory, reviews, releasedAt } = data;

        let bookDetails = await bookModel.find({ isDeleted: false, $or: [{ bookId: bookId }, { title: title }, { excerpt: excerpt }, { userId: userId }, { category: category }, { releasedAt: releasedAt }, { subCategory: subCategory }, { reviews: reviews }] });
        if (!bookDetails) {
            res.status(404).send({ status: false, msg: "No book exist" })

        } else {
            res.status(200).send({ status: true, msg: "Books list", data: bookDetails })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: false, msg: error.message });
    }
};


// ----------------------------------------------------------------------------------------- //
// Get Books By Id

const getBooksById = async function (req, res) {
    try {
        let bookId = req.params.bookId;

        if (!isValidObjectId(bookId)) {
            res.status(404).send({ status: false, msg: "Invalid BookId" })
            return
        }
        let bookData = await bookModel.findOne({ _id: bookId, isDeleted: false })
        if (!isValid(bookData)) {
            res.status(400).send({ status: false, msg: "There is no book with this bookId" })
            return
        }
        const reviews = await reviewModel.find({ bookId: bookId, isDeleted: false }).select({
            _id: 1, bookId: 1, reviewedBy: 1, reviewedAt: 1, rating: 1, review: 1
        })

        bookData.reviewsData = reviews;
        res.status(200).send({ status: true, msg: "Book List", data: bookData })
        return

    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};


// ----------------------------------------------------------------------------------------- //
// Update Book

const updateBook = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let data = req.body;
        const updateData = await bookModel.findById(bookId);
        if (!isValid(updateData)) {
            res.status(400).send({ status: false, msg: "BookId is not present" })
            return
        }
        if (updateData.isDeleted == true) {
            res.status(404).send({ status: false, msg: "The Book you want to update has been deleted" })
            return
        }
        const updateDetails = await bookModel.findByIdAndUpdate(bookId, data, { new: true });
        res.status(200).send({ status: true, msg: updateDetails })
        return
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};

// -------------------------------------------------------------------------------------------- //
// Delete Books

const deleteById = async function (req, res) {
    try {
        let bookId = req.params.bookId;
        let data = req.body;

        if (!isValid(bookId)) {
            res.status(400).send({ status: false, msg: "BookId is required" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, msg: "Invalid BookId" })
            return
        }
        let filter = { isDeleted: false, _id: bookId };
        let deletedBook = await bookModel.findOneAndUpdate(filter, { isDeleted: true, deletedAt: new Date() }, { new: true });
        if (!isValid(deletedBook)) {
            res.status(404).send({ status: false, msg: "Book not found" })
            return
        }
        if (deletedBook) {
            res.status(200).send({ status: true, msg: "Book deleted successfully" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({ msg: error.message });
    }
};


// ------------------------------------------------------------------------------------------- //
// Exports

module.exports.createBooks = createBooks;
module.exports.getBooks = getBooks;
module.exports.getBooksById = getBooksById;
module.exports.updateBook = updateBook;
module.exports.deleteById = deleteById;