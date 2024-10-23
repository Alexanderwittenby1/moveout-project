const emailService = require('../services/emailService');
const userService = require('../services/userService');
const bcrypt = require('bcrypt');

exports.registerUser = async (req, res) => {
    const {email, password, firstname, lastname} = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    try {
        const verificationCode = await userService.createUser(email, passwordHash, firstname, lastname);
        await emailService.sendVerificationEmail(email, verificationCode);
        res.status(201).send('Registration successful! Please check your email for the verification code.');
    } catch (error) {
        console.error('Error registering user:', error);
    }};

exports.verifyUser = async (req, res) => {
    const {email, code} = req.body;

    try {
        const isVerified = await userService.verifyUser(email, code);
        if (isVerified) {
            res.status(200).send('Email verified successfully!');
        } else {
            res.status(401).send('Invalid verification code.');
        } 
        
    } catch (error) {
        console.error('Error verifying user:', error);
    }
}
