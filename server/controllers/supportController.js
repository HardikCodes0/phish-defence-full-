const sendMail = require('../utils/mail');

// POST /api/support/contact
const handleContactForm = async (req, res) => {
  const { name, email, subject, message, priority } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  try {
    const adminEmail = process.env.EMAIL_USER || 'hardikbatra301@gmail.com';
    const mailSubject = `[Support Query][${priority}] ${subject}`;
    const mailHtml = `
      <h2>New Support Query from ${name}</h2>
      <p><b>Email:</b> ${email}</p>
      <p><b>Priority:</b> ${priority}</p>
      <p><b>Subject:</b> ${subject}</p>
      <p><b>Message:</b></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `;
    await sendMail(adminEmail, mailSubject, mailHtml);
    res.json({ message: 'Support query sent successfully.' });
  } catch (err) {
    console.error('Support contact error:', err);
    res.status(500).json({ message: 'Failed to send support query.' });
  }
};

module.exports = { handleContactForm }; 