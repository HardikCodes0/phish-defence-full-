const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendMail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    html,
  };
  return transporter.sendMail(mailOptions);
};

module.exports = sendMail; 