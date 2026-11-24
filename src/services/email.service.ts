import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendWelcomeEmail(to: string, name: string): Promise<void> {
    const subject = "Welcome to Our Service!";
    const html = this.getWelcomeEmailTemplate(name);

    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn("SMTP credentials not provided. Email simulation:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        // console.log(`Body: ${html}`); // Too verbose for log
        return;
      }

      await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Support Team'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Welcome email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  private getWelcomeEmailTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .content h2 {
      color: #2d3748;
      font-size: 22px;
      margin-top: 0;
    }
    .button {
      display: inline-block;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      background-color: #edf2f7;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
    }
    .social-links {
      margin-top: 10px;
    }
    .social-links a {
      color: #718096;
      margin: 0 5px;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome Aboard!</h1>
    </div>
    <div class="content">
      <h2>Hello ${name},</h2>
      <p>We are thrilled to have you join us! Thank you for expressing interest in our services.</p>
      <p>Our team is dedicated to providing you with the best experience possible. We have received your details and one of our specialists will be in touch with you shortly.</p>
      <div style="text-align: center;">
        <a href="#" class="button">Visit Our Website</a>
      </div>
      <p>If you have any immediate questions, feel free to reply to this email.</p>
      <p>Best Regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
      <div class="social-links">
        <a href="#">Facebook</a> | <a href="#">Twitter</a> | <a href="#">LinkedIn</a>
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  async sendPasswordResetEmail(to: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
    const subject = "Password Reset Request";
    const html = this.getPasswordResetTemplate(resetLink);

    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.warn("SMTP credentials not provided. Email simulation:");
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Reset Link: ${resetLink}`);
        return;
      }

      await this.transporter.sendMail({
        from: `"${process.env.SMTP_FROM_NAME || 'Support Team'}" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html,
      });
      console.log(`Password reset email sent to ${to}`);
    } catch (error) {
      console.error("Error sending email:", error);
    }
  }

  private getPasswordResetTemplate(resetLink: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: 40px;
      margin-bottom: 40px;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
      color: #333333;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      background-color: #667eea;
      color: #ffffff;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-weight: bold;
      margin-top: 20px;
      margin-bottom: 20px;
    }
    .footer {
      background-color: #edf2f7;
      padding: 20px;
      text-align: center;
      color: #718096;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Hello,</p>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>To reset your password, click the button below:</p>
      <div style="text-align: center;">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p style="word-break: break-all; color: #667eea;">${resetLink}</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best Regards,<br>The Team</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Your Company Name. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}
