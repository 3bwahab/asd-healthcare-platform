const nodemailer = require("nodemailer");
const renderEmailTemplate = require("./emailRenderer");

/**
 * Send email using Nodemailer with HTML template support
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text email message body (fallback)
 * @param {string} [options.template] - Name of HTML template to use (optional)
 * @param {Object} [options.templateData] - Data to inject into template (optional)
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  // 1. Create transporter with SMTP configuration
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // Use SSL/TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2. Define email options
  const mailOptions = {
    from: `ASD Healthcare Platform <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message, // Plain text fallback
  };

  // 3. Add HTML content if template is provided
  if (options.template && options.templateData) {
    try {
      const htmlContent = await renderEmailTemplate(
        options.template,
        options.templateData
      );
      mailOptions.html = htmlContent;
    } catch (error) {
      console.error("Error rendering email template:", error);
      // Fall back to plain text if template rendering fails
    }
  }

  // 4. Send email
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
