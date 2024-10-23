"use strict";

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const userModel = require('../models/userModel');
const { getGoogleLoginUrl } = require('../services/googleService');
const axios = require('axios');

// Visa inloggningssidan
router.get('/login', (req, res) => {
    const googleLoginUrl = getGoogleLoginUrl();
    res.render('login', { title: 'Login page', googleLoginUrl , messages: req.flash() });
});


router.get('/api/sessions/oauth/google', async (req, res) => {
    const { code } = req.query;

    // Steg 1: Byt 'code' mot access token
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', null, {
        params: {
            code: code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: 'authorization_code'
        }
    });

    const accessToken = tokenResponse.data.access_token;
    // Steg 2: Hämta användardata
    const userInfoResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    const userData = userInfoResponse.data;
    // Steg 3: Logga in användaren
    const user = await userModel.loginUserWithGoogle(userData.sub, userData.name, userData.email, userData.email_verified, userData.picture);
    // Sätt användardata i sessionen
    req.session.user = {
        id: user.user_id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        createdAt: user.created_at,
        isVerified: user.is_verified,
        profile_picture: user.profile_picture,
        isAdmin: user.is_admin,
        isActive: user.is_active
    };

    res.redirect('/profile');
});











router.post('/login', async (req, res) => {
    try {
        
        const { email, password } = req.body;
        
        
        const user = await userModel.login(email, password);

        if (user) {
            req.session.user = {
                id: user.user_id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at,
                isVerified: user.is_verified,
                profile_picture: user.profile_picture,
                isAdmin: user.is_admin,
                isActive: user.is_active
            };
            res.redirect('/profile');
        } else {
            req.flash('error', 'Invalid email or password');
            res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        req.flash('error', 'An error occurred');
    }
});











router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
        }
        res.redirect('/');
        
    });
});


module.exports = router;
