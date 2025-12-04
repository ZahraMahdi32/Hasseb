const nodemailer = require("nodemailer");

// DEBUG: Check if .env loaded correctly
console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "Loaded" : "MISSING");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendWelcomeEmail(to, fullName, username) {
    try {
        await transporter.sendMail({
            from: `"HASEEB App" <${process.env.EMAIL_USER}>`,
            to,
            subject: "Welcome to HASEEB!",
            text: `
Hello ${fullName},  

Welcome to HASEEB — we’re excited to have you on board! 🎉  

Your account has been created successfully.  
Here are your login details:

Username: ${username}

You can now sign in and start exploring tools that help you make smarter financial decisions.

If you ever need help, feel free to reach out.  
Thank you for joining the HASEEB community!

Warm regards,  
The HASEEB Team  

            `
        });
    } catch (err) {
        console.error("❌ Email sending failed:", err);
    }
}

async function sendPasswordChangedEmail(to, fullName) {
  try {
    await transporter.sendMail({
      from: `"HASEEB App" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your HASEEB Password Has Been Updated",
      text: `
Hello ${fullName},

Your HASEEB account password was successfully updated.

If you did not perform this action, contact support immediately.

Stay secure,
HASEEB Team`
    });
  } catch (err) {
    console.error("❌ Failed to send password-changed email:", err);
  }
}

module.exports = { sendWelcomeEmail, sendPasswordChangedEmail };
