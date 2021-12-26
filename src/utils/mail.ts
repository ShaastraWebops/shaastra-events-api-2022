import dotenv from "dotenv";
const SibApiV3Sdk = require("sib-api-v3-typescript");

dotenv.config();

let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

let apiKey = apiInstance.authentications["apiKey"];
apiKey.apiKey = process.env.MAIL_API_KEY;
export const mail = async ({
  email,
  sub,
  body,
}: {
  email: string;
  sub: string;
  body: string;
}) => {
  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = sub;
  sendSmtpEmail.htmlContent = body;
  sendSmtpEmail.sender = {
    name: "Shaastra Webops",
    email: "webops@shaastra.org",
  };
  sendSmtpEmail.to = [{ email: email }];

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function (data: any) {
      console.log(
        "API called successfully. Returned data: " + JSON.stringify(data)
      );
    },
    function (error: any) {
      console.error(error);
    }
  );
};