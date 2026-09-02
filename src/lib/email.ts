import nodemailer from 'nodemailer';

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  let transporter;

  // Use configured SMTP if available
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // For development/testing: use ethereal email which creates fake catch-all inbox
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  const mailOptions = {
    from: '"Co-opConnect Security" <noreply@coopconnect.com>',
    to: email,
    subject: 'Reset Your Co-opConnect Password',
    text: `You have requested to reset your password for Co-opConnect.\n\nPlease click the link below to securely reset your password:\n\n${resetUrl}\n\nThis link will expire in 30 minutes.\nIf you did not request this, please ignore this email.\n\nThank you,\nThe Co-opConnect Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0f172a;">Co-opConnect Password Reset</h2>
        <p style="color: #334155; line-height: 1.6;">You have requested to reset your password for your Co-opConnect account.</p>
        <p style="color: #334155; line-height: 1.6;">Please click the button below to securely reset your password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">This link will expire in 30 minutes.</p>
        <p style="color: #64748b; font-size: 14px; line-height: 1.5;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">The Co-opConnect Team</p>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  // If we used ethereal, log the preview URL for testing purposes
  if (!process.env.SMTP_HOST) {
    console.log('--- TEST EMAIL SENT ---');
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    console.log('-----------------------');
  }

  return info;
}
