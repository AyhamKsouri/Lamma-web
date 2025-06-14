// src/services/mail.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false, // true if port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export async function sendInviteEmail(to: string, event: { title: string; _id: string; location: string; startDate: string; startTime: string }) {
  const link = `https://yourapp.com/events/${event._id}`;
  await transporter.sendMail({
    from: `"Lamma Events" <${process.env.SMTP_USER}>`,
    to,
    subject: `You’re invited to ${event.title}!`,
    html: `
      <h2>You’re invited to <strong>${event.title}</strong></h2>
      <p>${event.startDate} @ ${event.startTime} — ${event.location}</p>
      <p><a href="${link}">RSVP & view details →</a></p>
    `,
  });
}
