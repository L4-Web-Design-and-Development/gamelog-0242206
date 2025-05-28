import nodemailer from 'nodemailer';

const { EMAIL_USER, EMAIL_PASS } = process.env;

if (!EMAIL_USER || !EMAIL_PASS) {
  throw new Error('EMAIL_USER and EMAIL_PASS must be set in environment variables');
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `GameLog <${EMAIL_USER}>`,
    to,
    subject: 'Reset your GameLog password',
    html: `<p>Click the link below to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`
  };

  await transporter.sendMail(mailOptions);
}
