import { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware: ErrorRequestHandler = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong try again later",
  };
  if (err.name === "ValidationError") {
    customError.msg = Object.values(err.errors)
      .map((item: any) => item.message)
      .join(",");
    customError.statusCode = 400;
  }
  if (err.name === "CastError") {
    customError.msg = `No item found with id ${err.value}`;
    customError.statusCode = 404;
  }
  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate Value entered ${Object.keys(err.keyValue)} field, please choose another value`;
    customError.statusCode = 400;
  }
  res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;

// import { Request, Response } from "express";
// import HttpException from "../errors/httpExceptions";

// function errorMiddleware(error: HttpException, req: Request, res: Response) {
//   const status: number = error.status || 500;
//   const message: string = error.message || "Something went wrong";

// //   console.log("[ERROR] ", status, message);

//   res.status(status).json({ message });
// }

// export default errorMiddleware;
