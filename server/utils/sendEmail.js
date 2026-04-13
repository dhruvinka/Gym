const nodemailer = require("nodemailer");

const sendEmail = async (email, subject, message) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_SMTP_USER,
      pass: process.env.BREVO_SMTP_PASS
    }
  });

  const info = await transporter.sendMail({
    from: '"TITAN FIT" <kdhruvin4@gmail.com>', // verified sender
    to: email,
    subject,
    text: message
  });

  console.log("Email sent response:", info);
};

module.exports = sendEmail;
