// Custom Error Class for Express

class ExpressError extends Error {

  constructor(statusCode, message) {
    super(); // Error class ko call karta hai

    this.statusCode = statusCode; // HTTP status code store karega
    this.message = message; // Error message store karega
  }

}

module.exports = ExpressError;