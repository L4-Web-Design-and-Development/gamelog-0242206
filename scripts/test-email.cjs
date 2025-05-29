// scripts/test-email.cjs
// Run with: node ./scripts/test-email.cjs
const { sendVerificationEmail } = require('../app/utils/email.server');

const testEmail = process.env.EMAIL_USER || 'your@email.com';
const testUrl = 'https://example.com/verify-test';

(async () => {
  try {
    await sendVerificationEmail(testEmail, testUrl);
    console.log('Test verification email sent to:', testEmail);
  } catch (err) {
    console.error('Failed to send test email:', err);
  }
})();
