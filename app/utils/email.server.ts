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

export async function sendVerificationEmail(to: string, verifyUrl: string) {
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
    subject: 'Verify your GameLog account',
    html: `<p>Click the link below to verify your email address and activate your account:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
  };

  await transporter.sendMail(mailOptions);
}

export async function sendAccountDeletedEmail(to: string) {
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
    subject: 'Your GameLog account has been deleted',
    html: `<p>Your GameLog account has been successfully deleted. If this was not you, please contact support immediately.</p>`
  };

  await transporter.sendMail(mailOptions);
}
