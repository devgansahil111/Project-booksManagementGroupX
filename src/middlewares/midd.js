// -------------------------------------------------------------------------------------- //
// Require Packages

const jwt = require("jsonwebtoken");
const bookModel = require("../models/bookModel");

// --------------------------------------------------------------------------------------- //
// Validation Formatting

const isValid = function (value) {
  if (typeof value === "undefined" || value === "null") return false
  if (typeof value === "string" && value.trim().length === 0) return false
  return true;
}

// ---------------------------------------------------------------------------------------- //
// Authentication 

const auth = function (req, res, next) {
  try {
    let token = req.headers["x-api-key"]
    if (!isValid(token)) {
      res.status(401).send({ status: false, msg: "Token is required" })
      return
    }
    let decodedToken = jwt.verify(token, "Project-03-Group37-BooksManagement")
    if (!isValid(decodedToken)) {
      res.status(401).send({ status: false, msg: "Token is invalid" })
      return
    }
    next();
  }
  catch (error) {
    console.log(error)
    res.status(500).send({ msg: error.message })
  }
};

// -------------------------------------------------------------------------------------- //
// Autherization


const authorize = async function (req, res, next) {
  let token = req.headers["x-auth-token"];

  if (!isValid(token)) {
    res.status(404).send({ status: false, msg: "Please pass token" });
    return
  }

  let decodedToken = jwt.verify(token, "Project-03-Group37-BooksManagement");

  let bookId = req.params.bookId;
  console.log(bookId);
  if (!isValid(bookId)) {
    let userId = req.body.userId;
    console.log(userId, decodedToken.userId, "1");
    if (userId == decodedToken.userId) {
      next();

    } else {
      res.status(403).send({ status: false, msg: "You are not authorized" });
      return
    }

  } else {
    let bookIdPresent = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!isValid(bookIdPresent)) {
      res.status(400).send({ status: false, msg: "Book id is not present" });
      return
    }

    console.log(bookIdPresent.userId, decodedToken.userId, "2");
    if (bookIdPresent.userId != decodedToken.userId) {
      res.status(403).send({ status: false, msg: "You are not authorized" });
      return

    } else {
      next();
    }
  }
};


// --------------------------------------------------------------------------------- //
// Exports

module.exports.auth = auth;
module.exports.authorize = authorize;
