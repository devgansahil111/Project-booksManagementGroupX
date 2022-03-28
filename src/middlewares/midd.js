// -------------------------------------------------------------------------------------- //
// Require Packages

const jwt = require("jsonwebtoken");

// --------------------------------------------------------------------------------------- //
// Validation Formatting

const isValid = function (value){
    if (typeof value === "undefined" || value === "null") return false
    if (typeof value === "string" && value.trim().length === 0) return false
    return true;
}

// ---------------------------------------------------------------------------------------- //
// Authentication 

const auth = function (req, res, next) {
    let token = req.headers["x-auth-token"];
    if (!isValid(token)) {
      res.send({ status: false, msg: "Token must be present" });
      return
    }
    console.log(token);
  
    let decodedToken = jwt.verify( token, "Project-03-Group37-BooksManagement" );
    console.log(decodedToken);
    if ( decodedToken.userId == req.body.userId ) {
      next();
    } else {
      res.send({ status: false, msg: "Invalid Token" });
      return
    }
  };
  

  // --------------------------------------------------------------------------------- //
  // Exports
  
  module.exports.auth = auth;