// not Found

const notFound = (req, res, next) => {
  const error = new Error(`Not Found : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Error Handler

const errorHandler = (err, req, res, next) => {
  const statuscode = res.statusCode == 200 ? 500 : res.statusCode;
  res.status(statuscode);
  res.json({
    status: "fail",
    message: err?.message,
    stack: err?.stack,
  });
};
const mongooseError = (err, res) => {
  let error;
  if (err.name == "ValidationError") {
    res.status(400);
    let errors = Object.values(err.errors).map((el) => el.message);
    let fields = Object.values(err.errors).map((el) => el.path);
    if (errors.length > 1) {
      const formattedErrors = errors.join("\n")
      error = { status: "fail", message: formattedErrors, stack: fields };
      error = formattedErrors;
    } else {
      // res.send({ status: "fail", message: errors, stack: fields });
      error = errors;
    }
  } else if (err.code == 11000) {
    res.status(409);
    const field = Object.keys(err.keyValue);
    const errorm = `The given ${field} already in used.`;
    // res.send({ status: "fail", message: errorm, stack: err });
    error = errorm;
  } else if (err.name == "CastError") {
    res.status(404);
    error = "The requested document is not Found!";
    // res.send({ status: "fail", message: error, stack: err })
  } else {
    error = err;
  }
  throw new Error(error);
};

module.exports = { errorHandler, notFound, mongooseError };
