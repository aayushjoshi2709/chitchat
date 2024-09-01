const { StatusCodes } = require("http-status-codes");
const dtoValidator = (dto, validateKey) => {
  return (req, res, next) => {
    const data = req[validateKey];
    console.log("here i am");
    errors = [];
    for (const key in dto) {
      if (data[key] === undefined) {
        errors.push(`${key} is required`);
      } else if (typeof data[key] !== dto[key]) {
        errors.push(`${key} is not of type ${dto[key]}`);
      }
    }

    if (errors.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({ error: errors });
    }
    next();
  };
};
module.exports = dtoValidator;
