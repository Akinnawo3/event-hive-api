import { NextFunction, Request, Response, response } from "express";
import { StatusCodes } from "http-status-codes";
import Users from "../models/Users";
import crypto from "crypto";
import Token from "../models/Token";
import { setupRegistationOtpEmail } from "../helpers/emails";
import mongoose from "mongoose";
import { signupSchema } from "../models/validations/schemas";

class AuthController {
  public signup = async (req: Request, res: Response) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { name, email, telephone, password } = req.body;
      //validate input
      const { error } = signupSchema.validate(req.body);
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: error.details[0].message,
        });
      }

      //check if user exist
      let user = await Users.findOne({ email });

      if (user && !user.emailVerified) {
        const { email, telephone, emailVerified, phoneVerified } = user?.toObject();
        res.status(StatusCodes.OK).json({
          message: "User already exists but email is not verified. Please verify email",
          user: { email, telephone, emailVerified, phoneVerified },
        });
        // res.status(StatusCodes.CONFLICT).json({ message: "User already exists." });
      }

      user = await Users.create({ ...req.body });
      if (user) {
        const { email, telephone, emailVerified, phoneVerified } = user?.toObject();
        const emailToken = crypto.randomBytes(32).toString("hex");
        const tokenEmail = Token.create({
          userId: user._id,
          token: emailToken,
          mode: "email",
          usage: "signup",
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        });
        const phoneOTP = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP
        const tokenPhone = Token.create({
          userId: user._id,
          token: phoneOTP.toString(),
          mode: "phone",
          usage: "signup",
          expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        });

        const notification = setupRegistationOtpEmail({ email, emailToken, phoneNumber: req.body.telephone, phoneOTP });
        await notification.sendEmail();
        // const smsReq = await notification.sendSms();
        // console.log("smsReq", smsReq);

        res.status(StatusCodes.CREATED).json({
          message: "Signup successful, check email and sms for verification",
          user: {
            email,
            telephone,
            emailVerified,
            phoneVerified,
          },
        });
      }
    } catch (error) {
      await session.abortTransaction();
      console.error("Signup Error:", error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred during signup. Please try again.",
      });
    } finally {
      session.endSession();
    }
  };

  public login = (req: Request, res: Response) => {
    res.status(200).json({ msg: "Login" });
  };

  public verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, telephone, token, mode } = req.body;

      // Validate mode
      if (!["email", "phone"].includes(mode)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: "Invalid mode. Mode must be either 'email' or 'phone'.",
        });
      }

      // Build the query based on the mode
      const query: any = { token, mode, usage: "signup" };
      if (mode === "email") {
        if (!email) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Email is required for email verification.",
          });
        }
        const user = await Users.findOne({ email });
        if (!user) {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "User not found for the provided email.",
          });
        }
        query.userId = user._id;
      } else if (mode === "phone") {
        if (!telephone) {
          return res.status(StatusCodes.BAD_REQUEST).json({
            message: "Phone number is required for phone verification.",
          });
        }
        const user = await Users.findOne({ telephone });
        if (!user) {
          return res.status(StatusCodes.NOT_FOUND).json({
            message: "User not found for the provided phone number.",
          });
        }
        query.userId = user._id;
      }

      // Search for the token in the database
      const otpToken = await Token.findOne(query);
      if (!otpToken) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "Invalid or expired OTP.",
        });
      }

      // Verify if the OTP has expired
      if (otpToken.expiresAt < new Date()) {
        await Token.deleteOne({ _id: otpToken._id }); // Remove expired token
        return res.status(StatusCodes.UNAUTHORIZED).json({
          message: "OTP has expired. Please request a new one.",
        });
      }

      // Mark the email or phone as verified
      if (mode === "email") {
        await Users.updateOne({ _id: otpToken.userId }, { emailVerified: true });
      } else if (mode === "phone") {
        await Users.updateOne({ _id: otpToken.userId }, { phoneVerified: true });
      }

      // Remove the token after successful verification
      await Token.deleteOne({ _id: otpToken._id });

      res.status(StatusCodes.OK).json({
        message: `${mode === "email" ? "Email" : "Phone"} verification successful.`,
      });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: "An error occurred during OTP verification.",
      });
    }
  };
}

export default AuthController;
