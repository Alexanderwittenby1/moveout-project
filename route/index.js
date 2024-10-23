"use strict";

const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const emailService = require('../services/emailService');
const boxService = require('../services/boxService');
const s3Service = require('../services/s3service');
const qrCode = require('qrcode');
const multer = require('multer')
const uuid = require('uuid').v4;
const storage = multer.memoryStorage()
const upload = multer({ storage })



router.get('/', (req, res) => {
    res.render('home', { title: 'Move out Home Page' });
});





// Visa registreringssidan
router.get('/register', (req, res) => {
    res.render('register', { title: 'Register' });
});






router.get('/create-admin', (req, res) => {
    res.render('createAdmin', { title: 'Create Admin' });
});






// skapa en adminanvändare
router.post('/create-admin', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const verificationCode = await userService.createAdmin(email, password, firstName, lastName);

        await emailService.sendVerificationEmail(email, verificationCode);
        res.redirect('/login');
    } catch (err) {
        console.error(err);
    }});







// Hantera registreringsformulärsdata
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        const verificationCode = await userService.createUser(email, password, firstName, lastName);
        
        await emailService.sendVerificationEmail(email, verificationCode);
        
        res.redirect('/login');
    } catch (err) {
       
        if (err.message === 'User already exists' ) {
            res.status(400).render('error',{
                errorMessage: 'Användare med denna e-postadress finns redan.',
                title: 'Registreringsfel'
            });
        } else {
            res.status(500).render('error', {
                errorMessage: 'Ett fel inträffade vid registreringen: ' + err.message,
                title: 'Registreringsfel'
            });
        }
        
    }
});








router.get('/profile', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); 
        }

        const user = req.session.user;
        console.log('User under /profile:', user);
        res.render('profile', { user, title: "Profile page" });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});








router.post('/profile/picture', upload.single("file"), async (req, res) => {
    try {
        if (!req.session.user && !req.session.user.isVerified) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

        const file = req.file;
        const email = req.session.user.email;
        const result =  await s3Service.uploadFile(file);

        await userService.updateProfilePicture(email, result['Location']);
        req.session.user.profile_picture = result['Location'];
        console.log('File uploaded:', result['Location']);

        res.redirect('/profile');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});









router.post('/profile/verify', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

        const { verificationCode } = req.body;
        const email = req.session.user.email;

        const result = await userService.verifyUser(email, verificationCode);

        if (result) {
            req.session.user.isVerified = true; // Uppdatera användarens verifieringsstatus i sessionen
            res.redirect('/profile');
        } else {
            res.send('Invalid verification code.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});







router.post('/profile/updateEmail', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

        const { email } = req.body;
        const result = await userService.updateEmail(req.session.user.email, email);

        if (result) {
            req.session.user.email = email; // Uppdatera e-postadressen i sessionen
            res.redirect('/profile');
        } else {
            res.send('Error updating email.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});






router.get('/create', (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
    res.render('getStarted', { title: 'Create box' });
});






router.post('/create-label', upload.single("file"), async function(req, res) {
    try {
        const { box_name, content, label, photo, audio, background, visibility } = req.body;
        const user_id = req.session.user.id;
        // console.log(req.body);
        

        let audioUrl = null;
        let pictureUrl = null;
        let pin = null;

        if (visibility === 'private') {
            pin = boxService.generatePin();
        }

        

        if (audio) {
            console.log('Audio Base64 Data:', audio);
            const base64Data = audio.replace(/^data:audio\/mpeg;base64,/, "");  // Tar bort base64 prefix
            const buffer = Buffer.from(base64Data, 'base64');
            console.log("Converted buffer:", buffer);  // Konverterar Base64 till Buffer
            const uploadResult = await s3Service.uploadAudio(buffer, `recorded-audio-${Date.now()}.mp3`);
            console.log('Upload result:', uploadResult);
            
            audioUrl = uploadResult.Location;
            console.log('Audio URL:', audioUrl);
        }


        if (photo) {
            try {
              
                const fileName = `photo-${Date.now()}.jpeg`; 

                
                const uploadResult = await s3Service.uploadPhoto(photo, fileName);

                // Log the result of the upload
                console.log('Upload result:', uploadResult);

                // Save the picture URL from the S3 response
                pictureUrl = uploadResult.Location;
                console.log('Photo URL:', pictureUrl);
            } catch (error) {
                console.error('Error uploading photo:', error);
            }
        }

        // Om en fil laddades upp
        if (req.file) {
            console.log("Received file:", req.file);
            const file = req.file;
            const buffer = req.file.buffer;
            const fileMimeType = req.file.mimetype;
            console.log('File:', file);

            // Kontrollera om filen är en bild eller ljudfil
            if (fileMimeType.startsWith('image/')) {
                // Ladda upp bild till S3 och få URL
                const uploadResult = await s3Service.uploadFile(file);
                pictureUrl = uploadResult.Location;
            } else if (fileMimeType.startsWith('audio/')) {
                // Ladda upp ljudfil till S3 och få URL
                const uploadResult = await s3Service.uploadAudio(buffer, file.originalname);
                audioUrl = uploadResult.Location;
            }
        }

        // Spara etiketten i databasen med korrekta URL:er
        const box = await boxService.createBox(user_id, box_name, content, label, audioUrl, pictureUrl, background , visibility, pin);

        console.log('Box created:', box);
        res.redirect('/boxes');
    } catch (err) {
        console.error('Error creating label or QR code:', err);
        res.status(500).send('Error: ' + err.message);
    }
});






router.get('/boxes', async (req, res) => {
    try {

        if (!req.session.user && !req.session.user.isVerified) {
                return res.redirect('/login'); 
            }
        
            const allBoxes = await boxService.getUserBoxes(req.session.user.id);
            const data = allBoxes.map(box => {
                return {
                    id: box.box_id,
                    content: box.content,
                    boxName: box.box_name,
                    label: box.label_design,
                    qrCode: qrCode.toDataURL(box.box_id.toString())
                };
                
            });
            
            res.render('boxes', { boxes:data, title: 'Boxes' });

    } catch (err) {
        console.error('Error displaying QR code:', err);
        res.status(500).send('Error: ' + err.message);
    }
});


router.get('/profile/changepassword', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); 
        }
        res.render('changePassword', { title: 'Change Password', message: req.flash(), user: req.session.user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});

router.post('/profile/changepassword', async (req, res) => {
    try {
        if(!req.session.user) {
            return res.redirect('/login');
        }
        const userId = req.session.user.id;
        const { oldPassword , newPassword, confirmPassword } = req.body;
        const user = await userService.getUserById(userId);
        console.log("user in post route:", user);
        

        const isOldPasswordCorrect = await userService.comparePasswords(oldPassword, user.password_hash);
        if (!isOldPasswordCorrect) {
            return res.send('Fel lösenord');
        }

        if (newPassword !== confirmPassword) {
            return res.send('Lösenorden matchar inte');
        }

        const result = await userService.changePassword(userId, newPassword);

        if (result) {
            res.redirect('/profile');
        } else {
            res.send('Error changing password.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});





router.get('/boxes/:id', async (req, res) => {
    try {
        const rootUrl = req.protocol + '://' + req.get('host');
        const boxId = req.params.id;
        const box = await boxService.getBoxById(boxId);
        const boxQrCode = await qrCode.toDataURL(rootUrl + "/box-content/" + boxId.toString());
        
        // Kontrollera om användaren är ägare av boxen
        if (box.user_id !== req.session.user.id) {
            req.flash('error', 'Du har inte behörighet att visa denna box.');
            return res.redirect('/boxes');  // Omdirigera till boxlista
        }

        res.render('singleBox', { box, boxQrCode, title: 'Box', background: box.background, message: req.flash() });
    } catch (err) {
        console.error('Error fetching box:', err);
        req.flash('error', 'Fel vid hämtning av box: ' + err.message);
        res.redirect('/boxes');  // Omdirigera till boxlista
    }
});



router.get('/admin/dashboard', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

        if (!req.session.user.isAdmin) {
            return res.status(403).send('You are not authorized to view this page');
        }

        const boxes = await boxService.getAllBoxes();
        const users = await userService.getAllUsers();
        const boxJoin = await boxService.getboxByOwner();
        res.render('dashboard', { boxes, title: 'Admin Dashboard', users , boxJoin});
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});





router.post('/admin/set-admin', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login'); // Om användaren inte är inloggad, omdirigera till inloggning
        }

        if (!req.session.user.isAdmin) {
            return res.status(403).send('You are not authorized to view this page');
        }

        const userId = req.body.user_id;
        const isAdmin = req.body.is_admin === '1';
        const result = await userService.setAdmin(userId, isAdmin);

        if (result) {
            res.redirect('/admin/dashboard');
        } else {
            res.send('Error setting admin');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});






router.get('/box-content/:id', async (req, res) => {
    try {
        const boxId = req.params.id;
        const box = await boxService.getBoxById(boxId);
        const userId = req.session.user ? req.session.user.id : null;

        // Om användaren är inloggad
        if (userId) {
            if (box.user_id === userId || boxService.userHasAccess(boxId, userId)) {
                // Om användaren är ägare av boxen, visa innehållet direkt
                return res.render('boxContent', { box, title: 'Box Content', messages: req.flash() });
            }

            // Om boxen är privat och användaren inte är ägaren, krävs PIN-kod
            if (box.visibility === 'private') {
                return res.render('boxPin', { boxId, title: 'Box PIN Required', messages: req.flash() });
            }

            // Om boxen är offentlig, visa innehållet direkt
            if (box.visibility === 'public') {
                return res.render('boxContent', { box, title: 'Box Content', messages: req.flash() });
            }
        } else {
            // För icke-inloggade användare
            req.flash('error', 'Du måste vara inloggad för att se denna box.');
            return res.redirect('/login');  // Omdirigera till inloggningssidan
        }

        // Om boxen inte hittas, hantera det
        req.flash('error', 'Boxen kunde inte hittas.');
        res.redirect('/boxes');

    } catch (err) {
        console.error('Error fetching box content:', err);
        req.flash('error', 'Fel vid hämtning av boxinnehåll: ' + err.message);
        res.redirect('/boxes');  // Omdirigera till boxlista
    }
});



router.post('/box-content/:id', async (req, res) => {
    try {
        const boxId = req.params.id;
        const { pin } = req.body;
        const box = await boxService.getBoxById(boxId);

        // Kontrollera om boxen är privat och om PIN-koden matchar
        if (box.visibility === 'private') {
            if (box.pin === pin) { // Kontrollera PIN-koden
                // Visa innehållet om PIN-koden är korrekt
                return res.render('boxContent', { box, title: 'Box Content', messages: req.flash() });
            } else {
                req.flash('error', 'Felaktig PIN-kod. Försök igen.');
                return res.redirect(`/box-content/${boxId}`); // Omdirigera tillbaka till PIN-inmatning
            }
        }

        // Om boxen är offentlig, visa innehållet direkt
        res.render('boxContent', { box, title: 'Box Content', messages: req.flash() });
    } catch (err) {
        console.error('Error fetching box content:', err);
        req.flash('error', 'Fel vid hämtning av boxinnehåll: ' + err.message);
        res.redirect('/boxes');  // Omdirigera till boxlista
    }
});





router.get('/sendemail', (req, res) => {
    res.render('mailForm', { title: 'Send Email to MoveOut Team', messages: req.flash() });
});




router.post('/sendmail', async (req, res) => {
    try {
        const { email, subject, message } = req.body; // Användarens e-postadress
        await emailService.sendEmail(email, subject, message, message); // Skicka till MoveOut-teamet
        res.redirect('/');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error: ' + err.message);
    }
});





router.post('/box-content/share-box', async (req, res) => {
    const { boxId, email } = req.body;
    const currentUserId = req.session.user.id; // Den användare som delar lådan

    try {
        // Kontrollera att lådan tillhör den nuvarande användaren
        const box = await boxService.getBoxById(boxId);
        if (box.user_id !== currentUserId) {
            return res.status(403).send('Du har inte behörighet att dela denna låda.');
        }

        // Hämta userId baserat på e-postadress
        const userToShareWith = await userService.getUserByEmail(email);
        if (!userToShareWith) {
            return res.status(404).send('Användaren med angiven e-postadress finns inte.');
        }

        // Spara delningen i databasen
        await boxShareService.shareBox(boxId, userToShareWith.id);

        req.flash('success', 'Lådan har delats framgångsrikt!');
        res.redirect(`/box-content/${boxId}`);
    } catch (error) {
        console.error('Error sharing box:', error);
        req.flash('error', 'Kunde inte dela lådan: ' + error.message);
        res.redirect(`/box-content/${boxId}`);
    }
});




module.exports = router;