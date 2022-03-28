// ------------------------------------------------------------------------------------ //
// Require Packages

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const reviewController = require("../controllers/reviewController");



// ------------------------------------------------------------------------------------- //
// User API's

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);


// -------------------------------------------------------------------------------------- //
// Book API's

router.post("/books", bookController.createBooks);
router.get("/books", bookController.getBooks);
router.get("/books/:bookId", bookController.getBooksById);
router.put("/books/:bookId", bookController.updateBook);
router.delete("/books/:bookId", bookController.deleteById);



// --------------------------------------------------------------------------------------- //
// Review API's

router.post("/review", reviewController.createReviews);
router.put("/review/:reviewId", reviewController.updateReviews);
router.delete("/review/:reviewId", reviewController.deleteReviews);


// --------------------------------------------------------------------------------------- //
// Export

module.exports = router;