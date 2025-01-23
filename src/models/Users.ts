import mongoose from "mongoose";
import bcrypt from "bcryptjs";

interface ValidationProps {
  value: string; // The value being validated
  path?: string; // The field name (optional)
  type?: string; // The validation error type (optional)
}
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide name"],
      maxLength: 50,
      minLength: 3,
    },
    email: {
      type: String,
      required: [true, "Please provide email"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (value: string) {
          // Define the regex or use other logic to validate the email
          const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
          return emailRegex.test(value);
        },
        message: (props: ValidationProps) => `${props.value} is not a valid email address`,
      },
    },
    telephone: {
      type: String,
      required: [true, "Please provide phone number"],
      unique: true,
      // validate: {
      //   validator: function (value: string) {
      //     const nigerianPhoneRegex = /^(?:\+234|234|0)(70|80|81|90|91|701|702|703|704|705|706|707|708|709|802|803|804|805|806|807|808|809|810|811|812|813|814|815|816|817|818|819|901|902|903|904|905|906|907|908|909|910|911|912)\d{6}$/;
      //     return nigerianPhoneRegex.test(value);
      //   },

      //   message: "Please enter a valid Nigerian phone number",
      // },
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password should be at least 8 charaters long"],
      validate: {
        validator: function (value: string) {
          // Regex to enforce:
          // - At least one uppercase letter
          // - At least one lowercase letter
          // - At least one number
          // - At least one special character
          // - Minimum of 8 characters (redundant here due to `minlength`)
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
        },
        message: "Password must contain at least one uppercase, one lowecase, one number, and one special character",
      },
    },
    emailVerified: { type: Boolean, default: false },
    phoneVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("User", UserSchema);
