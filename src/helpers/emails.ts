import SendNotification from "../utils/notifications";

interface ISetupRegistationOtpEmail {
  email: string;
  emailToken: string;
  phoneNumber: string;
  phoneOTP: number;
}

export const setupRegistationOtpEmail = ({ email, emailToken, phoneNumber, phoneOTP }: ISetupRegistationOtpEmail) =>
  new SendNotification({
    destination: email,
    subject: "Testing Email",
    body: `<div><h1>Email Notification testing for signup</h1>: this is your token ${emailToken} <div>`,
    phoneNumber,
    smsMessage: `This is your phone number verification code ${phoneOTP}`,
  });
