"use server";

import nodemailer from "nodemailer";

// Setup email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST!,
  port: process.env.SMTP_PORT!,
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD,
  },
} as nodemailer.TransportOptions);

interface EmailOptions {
  subject: string;
  html: string;
}

export async function sendNotificationEmails(options: EmailOptions) {
  try {
    // Send to office
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.OFFICE_EMAIL,
      subject: options.subject,
      html: options.html,
    });

    // Send to Developer
    await transporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to: process.env.DEV_EMAIL,
      subject: options.subject,
      html: options.html,
    });

    console.log("Notification emails sent successfully");
  } catch (error) {
    console.error("Failed to send notification emails:", error);
    // Note: We don't throw here to avoid failing the process
  }
}
