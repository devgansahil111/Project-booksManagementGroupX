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
        let { title, excerpt, userId, ISBN, category, subCategory, releasedAt } = data;

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
        if (!isValid(moment(releasedAt, "YYYY-MM-DD"))) {
            res.status(400).send({ status: false, msg: "Invalid date, month and year" })
            return
        }
        if (!isValid(releasedAt)) {
            res.status(400).send({ status: false, msg: "Released time is mandatory" })
            return
        }
        let userDetails = await userModel.findById(userId)
        if (!isValid(userDetails)) {
            res.status(404).send({ status: false, msg: "user id not exist" })
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
        let { userId, category, subCategory } = data;

        if (!isValid(userId)) {
            res.status(400).send({ status: false, msg: "UserId not present" })
            return
        }
        if (!isValidObjectId(userId)) {
            res.status(400).send({ status: false, msg: "Invalid userId" })
            return
        }
        if (!isValid(category)) {
            res.status(400).send({ status: false, msg: "Category not present" })
            return
        }
        if (!isValid(subCategory)) {
            res.status(400).send({ status: false, msg: "SubCategory not present" })
            return
        }
        let bookDetails = await bookModel.find({ isDeleted: false }).select({ _id: 1, excerpt: 1, title: 1, category: 1, subcategory: 1, ISBN: 1, releasedAt: 1, userId: 1 }).sort({ title: 1 });
        if (!isValid(bookDetails)) {
            res.status(404).send({ status: false, msg: "No book exist" })
            return

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

        if (!isValid(bookId)) {
            res.status(404).send({ status: false, msg: "BookId not present" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(404).send({ status: false, msg: "Invalid BookId" })
            return
        }
        let bookData = await bookModel.findById({ _id: bookId, isDeleted: false }).select({ __v: 0 }).lean();
        if (!isValid(bookData)) {
            res.status(400).send({ status: false, msg: "There is no book with this bookId" })
            return
        }
        const reviewData = await reviewModel.find({ $and: [{ bookId: bookId }, { isDeleted: false }] }).select({ isDeleted: 0, __v: 0, createdAt: 0, updatedAt: 0 });
        if (reviewData.length != 0) {
            bookData["reviewData"] = reviewData
        }
        else {
            bookData["reviewData"] = []
        }
        res.status(200).send({ status: true, msg: "Book list", data: bookData })
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
        const data = req.body;
        const { title, excerpt, releasedAt, ISBN } = data;
        const bookId = req.params.bookId;

        let finalFilter = {}

        if (!isValid(bookId)) {
            res.status(400).send({ status: false, msg: "Please provide bookId" })
            return
        }
        if (!isValidObjectId(bookId)) {
            res.status(400).send({ status: false, msg: "Please provide valid bookId" })
            return
        }
        if (!isValid(data)) {
            res.status(400).send({ status: false, msg: "Please provide input via body" })
            return
        }
        if (!isValid(title)) {
            res.status(400).send({ status: false, msg: "Title should be present" })
            return
        }
        const isTitleAlreadyExist = await bookModel.findOne({ $and: [{ title: title }, { isDeleted: false }] });
        if (isTitleAlreadyExist) {
            res.status(400).send({ status: false, msg: "Title Already Exists" })
            return
        }
        finalFilter["title"] = title;

        if (isValid(excerpt)) {
            finalFilter["excerpt"] = excerpt
        }
        if (isValid(releasedAt)) {
            if (!isValid(moment(releasedAt, "YYYY-MM-DD"))) {
                res.status(400).send({ status: false, msg: "Invalid date, month and year" })
                return
            }   
            finalFilter["releasedAt"] = releasedAt
        }
        if (isValid(ISBN)) {
            const isISBNAlreadyExist = await bookModel.findOne({ $and: [{ ISBN: ISBN }, { isDeleted: false }] });
            if (isISBNAlreadyExist) {
                res.status(400).send({ status: false, msg: "ISBN already exists" })
                return
            }
            finalFilter["ISBN"] = ISBN
        }
        const updatedData = await bookModel.findOneAndUpdate({ _id: bookId }, { $set: finalFilter }, { new: true });
        res.status(200).send({ status: true, msg: "Successfully updated Book Data", data: updatedData })
        return
    } catch (err) {
        res.status(500).send({ status: false, message: err.message })
        return
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