const RequestError = require("./RequstError");
const ctrlWrapper = require("./ctrlWrapper");

function tryCatchWrapper(endpointFn) {
  return async (req, res, next) => {
    try {
      await endpointFn(req, res, next);
    } catch (err) {
      next(err);
    }
  };
}

function createNotFoundHttpError() {
  const err = new Error("Not Found");
  err.status = 404;
  return err;
}

module.exports = {
  RequestError,
  ctrlWrapper,
  tryCatchWrapper,
  createNotFoundHttpError,
};
