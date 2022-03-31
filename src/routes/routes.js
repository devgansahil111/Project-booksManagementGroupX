// ------------------------------------------------------------------------------------ //
// Require Packages

const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const bookController = require("../controllers/bookController");
const reviewController = require("../controllers/reviewController");
const midd = require("../middlewares/midd");



// ------------------------------------------------------------------------------------- //
// User API's

router.post("/register", userController.createUser);
router.post("/login", userController.loginUser);


// -------------------------------------------------------------------------------------- //
// Book API's

router.post("/books", midd.auth, midd.authorize, bookController.createBooks);
router.get("/books", midd.auth, bookController.getBooks);
router.get("/books/:bookId", midd.auth, bookController.getBooksById);
router.put("/books/:bookId", midd.auth, midd.authorize, bookController.updateBook);
router.delete("/books/:bookId", midd.auth, midd.authorize, bookController.deleteById);



// --------------------------------------------------------------------------------------- //
// Review API's

router.post("/books/:bookId/review", reviewController.createReviews);
router.put("/books/:bookId/review/:reviewId", reviewController.updateReviews);
router.delete("/books/:bookId/review/:reviewId", reviewController.deleteReviews);


// --------------------------------------------------------------------------------------- //
// Export

module.exports = router;