const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: process.env.SMTP_SECURE !== "false",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

async function sendMail({ to, subject, html }) {
  if (!process.env.SMTP_HOST) {
    console.warn("SMTP not configured, skipping email to", to);
    return;
  }
  const from = process.env.SMTP_FROM || `"Qpeduli" <no-reply@qpeduli.com>`;
  await getTransporter().sendMail({ from, to, subject, html });
}

async function sendWelcomeEmail(user) {
  await sendMail({
    to: user.email,
    subject: "Selamat datang di Qpeduli",
    html: `<p>Halo ${user.name},</p><p>Akun kamu di Qpeduli sudah aktif. Yuk mulai jelajahi komunitas dan wujudkan aksi sosial pertamamu.</p>`,
  });
}

module.exports = { sendMail, sendWelcomeEmail };
