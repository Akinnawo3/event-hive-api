import nodemailer from "nodemailer";
import twilio from "twilio";

interface ISendNotification {
  destination: string;
  subject?: string;
  body?: string;
  phoneNumber?: string; // Optional for SMS
  smsMessage?: string; // Optional for SMS
}

class SendNotification {
  private destination: string;
  private subject?: string;
  private body?: string;
  private phoneNumber?: string;
  private smsMessage?: string;
  /**
   *
   */
  constructor({ destination, subject, body, phoneNumber, smsMessage }: ISendNotification) {
    this.destination = destination;
    this.subject = subject;
    this.body = body;
    this.phoneNumber = phoneNumber;
    this.smsMessage = smsMessage;
  }

  transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    // secureConnection: true, // true for 465, false for other ports
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  // transporter = nodemailer.createTransport({
  //   host: "smtp.gmail.com",
  //   port: 465, // Use 465 for SSL (secure connection)
  //   secure: true, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.EMAIL_USER, // Your Gmail email address
  //     pass: process.env.EMAIL_PASS, // App password generated for Gmail
  //   },
  // });

  async sendEmail() {
    try {
      return await this.transporter.sendMail({
        from: `"Maddison From Event Hive 👻" <${process.env.EMAIL_USER}>`, // sender address
        to: this.destination, // list of receivers
        subject: this.subject,
        text: "Hello world?", // plain text body
        html: this.body, // html body
      });
    } catch (error) {
      console.log("errorrr", error);
    }
  }

  async sendSms() {
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    console.log({
      body: this.smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
      to: this.phoneNumber!, // Recipient's phone number
    });
    try {
      return await client.messages.create({
        body: this.smsMessage,
        from: process.env.TWILIO_PHONE_NUMBER, // Your Twilio phone number
        to: this.phoneNumber!, // Recipient's phone number
      });
    } catch (error) {
      console.log(error);
    }
  }
}

export default SendNotification;
