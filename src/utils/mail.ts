import nodemailer from "nodemailer";
import { google } from "googleapis";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import dotenv from "dotenv";

dotenv.config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN});

export const mail = async ({ email, sub, body } : { email: string, sub: string, body: string }) => {
  const sendMail = async () => {
      try {
          const accessToken = await oAuth2Client.getAccessToken();

          const transport = nodemailer.createTransport({
              service: "gmail",
              host: "smtp-relay.sendinblue.com",
              port: 587,
              auth: {
                  type: 'OAuth2',
                  user: 'webops@shaastra.org',
                  clientId: CLIENT_ID,
                  clientSecret: CLIENT_SECRET,
                  refreshToken: REFRESH_TOKEN,
                  accessToken: accessToken,
              },
          }  as SMTPTransport.Options);

          const mailOptions = {
              from: 'webops@shaastra.org',
              fromName: 'Shaastra 2022',
              to: email,
              subject: sub,
              html: body
          };
          const result = await transport.sendMail(mailOptions);
          return result;
      } catch (error) {
          return error;
      }
  }
  sendMail()
  .then((result) => console.log("Email sent...", result))
  .catch((error) => console.log(error.message));
} 