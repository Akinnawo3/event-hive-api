import { StatusCodes } from "http-status-codes";
import CustomApiError from "./custom-api";

class BadRequestError extends CustomApiError {
  constructor(message: string) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

export default BadRequestError;
