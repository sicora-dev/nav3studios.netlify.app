const nodemailer = require("nodemailer");
const dns = require("dns");
const { promisify } = require("util");
const resolveMx = promisify(dns.resolveMx);

const transporter = nodemailer.createTransport({
  host: "smtp.ionos.es",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const validDomains = [
  // Google
  "gmail.com",
  "googlemail.com",

  // Microsoft
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "passport.com",

  // Yahoo
  "yahoo.com",
  "yahoo.es",
  "yahoo.co.uk",
  "yahoo.fr",
  "yahoo.de",
  "yahoo.it",
  "ymail.com",
  "rocketmail.com",

  // Apple
  "icloud.com",
  "me.com",
  "mac.com",

  // Other Popular Services
  "aol.com",
  "aim.com",
  "protonmail.com",
  "proton.me",
  "zoho.com",
  "mail.com",
  "gmx.com",
  "gmx.net",
  "tutanota.com",
  "tutanota.de",
  "fastmail.com",
  "fastmail.fm",

  // Spanish Providers
  "telefonica.net",
  "movistar.es",
  "orange.es",
  "vodafone.es",
  "jazztel.es",
  "ono.com",

  // Educational
  "edu",
  "ac.uk",
  "edu.es",
  "alumnojoyfe.iepgroup.es",
  "iepgroup.es",

  // Business/Professional
  "outlook.es",
  "corporativo.es",
  "empresa.es",

  // Internet Service Providers
  "comcast.net",
  "verizon.net",
  "att.net",
  "cox.net",
  "charter.net",
];

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const isValidEmail = async (email) => {
  // First check format
  if (!emailRegex.test(email)) {
    return false;
  }

  // Extract domain from email
  const domain = email.split("@")[1];

  try {
    // Check if domain has MX records
    const mxRecords = await resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch (error) {
    console.error("DNS lookup failed:", error);
    return false;
  }
};

const sendVerificationEmail = async (email, verificationToken) => {
  if (!isValidEmail(email)) {
    throw new Error(
      "Por favor, utiliza un email válido con un dominio conocido (gmail.com, hotmail.com, etc)"
    );
  }
  const mailOptions = {
    from: '"NAV3 Studios" <nav3studios@nav3studios.com>',
    to: email,
    subject: "Verifica tu cuenta en NAV3 Studios",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #EB5E28;">Verifica tu cuenta</h1>
        <p>Por favor, verifica tu cuenta haciendo click en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email/${verificationToken}" 
           style="background-color: #EB5E28; color: white; padding: 10px 20px; 
           text-decoration: none; border-radius: 5px; display: inline-block;">
          Verificar cuenta
        </a>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, resetToken) => {
  const mailOptions = {
    from: '"NAV3 Studios" <nav3studios@nav3studios.com>',
    to: email,
    subject: "Restablece tu contraseña en NAV3 Studios",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EB5E28;">Restablece tu contraseña</h1>
      <p>Para restablecer tu contraseña, haz click en el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/reset-password/${resetToken}" 
         style="background-color: #EB5E28; color: white; padding: 10px 20px; 
         text-decoration: none; border-radius: 5px; display: inline-block;">
        Restablecer contraseña
      </a>
    </div>
  `,
  };
  return transporter.sendMail(mailOptions);
};

const sendNewBookingEmail = async (booking, producerEmail, serviceName) => {
  try {
    const mailOptions = {
      from: '"NAV3 Studios" <nav3studios@nav3studios.com>',
      to: producerEmail,
      subject: "Nueva reserva en NAV3 Studios",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #EB5E28;">!Enhorabuena, tienes una nueva reserva¡</h1>
      <p>Detalles de la reserva:</p>
      <p>Servicio: ${serviceName}</p>
      <p>Fecha: ${booking.booking_date}</p>
      <p>Id de reserva: ${booking.id}</p>
      <p>Para aceptar o rechazar la reserva, haz click en el siguiente enlace:</p>
      <a href="${process.env.FRONTEND_URL}/account" 
         style="background-color: #EB5E28; color: white; padding: 10px 20px; 
         text-decoration: none; border-radius: 5px; display: inline-block;">
        Ver reservas
      </a>
    </div>`,
    };

    console.log("Attempting to send email with options:", {
      to: producerEmail,
      date: booking.booking_date,
      id: booking.id,
    });

    const result = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Email sending failed:", {
      error: error.message,
      code: error.code,
      command: error.command,
    });
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  isValidEmail,
  sendPasswordResetEmail,
  sendNewBookingEmail,
};
