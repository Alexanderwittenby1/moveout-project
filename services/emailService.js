// emailService.js
const nodemailer = require('nodemailer');

// Importera e-post och lösenord från .env
require('dotenv').config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL, 
        pass: process.env.PASSWORD, 
    },
});

const sendEmail = async (email, subject, text, html) => {
    const mailOptions = {
        from: process.env.EMAIL, // MoveOut-teamets e-postadress
        to: process.env.EMAIL, // MoveOut-teamets e-postadress
        subject: subject,
        text: text,
        html: html,
        replyTo: email // Användarens e-postadress
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent from ${email} to MoveOut-Team`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Could not send email');
    }
};




// Funktion för att skicka verifieringsmail
const sendVerificationEmail = async (recipientEmail, verificationCode) => {
    const mailOptions = {
        from: {
            name: 'MoveOut-Team',
            address: process.env.EMAIL,
        },
        to: recipientEmail,
        subject: 'Email Verification - MoveOut Application',
        text: `Welcome to MoveOut!
        
        Your verification code is: ${verificationCode}`,
        html: `<h1>Email Verification</h1><p>Your verification code is: <strong>${verificationCode}</strong></p>`,
    };

    try {
        // Skicka mailet
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${recipientEmail}`);
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw new Error('Could not send verification email');
    }
};



module.exports = {
    sendVerificationEmail,
    sendEmail,
};
