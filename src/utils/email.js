import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  // 1. Create Transporter (service that sends email)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email details
  const mailOptions = {
    from: "Shop Support",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3. Send email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;
