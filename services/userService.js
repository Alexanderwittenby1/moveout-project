const { generateVerificationCode } = require('../utils/generateCode');
const userModel = require('../models/userModel');
const { hashPassword } = require('../utils/hashUtils');
const bcrypt = require('bcrypt');

// Funktion för att skapa användare

const createUser = async (email, password, firstName, lastName) => {
    try {
        // Generera verifieringskod
        const verificationCode = generateVerificationCode();

        // Hasha lösenordet
        const passwordHash = await hashPassword(password);

        // Skapa användaren i databasen
        await userModel.createUser(
            email,
            passwordHash,
            firstName,
            lastName,
            verificationCode
        );

        // Returnera verifieringskoden
        return verificationCode;
    } catch (error) {
        console.error('Error creating user:', error);
        throw new Error('Could not create user');
    }
};

const getAllUsers = async () => {
    try {
        return await userModel.getAllUsers();
    } catch (error) {
        console.error('Error getting all users:', error);
        throw new Error('Could not retrieve users');
    }
};

const updateEmail = async (email, newEmail) => {
    try {
        return await userModel.updateEmail(email, newEmail);
    } catch (error) {
        console.error('Error updating email:', error);
        throw new Error('Could not update email');
    }
}

const verifyUser = async (email, code) => {
    try {
        // Hämta användaren baserat på e-post
        const user = await userModel.getUserByEmail(email);
        
        
        if (user && user.verification_code === code && !user.is_verified) {
            // Uppdatera användarens verifieringsstatus
            await userModel.updateUserVerificationStatus(email, true);
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error('Error verifying user:', error);
        throw new Error('Could not verify user');
    }
};


// Funktion för att hämta användare baserat på e-post
const getUserByEmail = async (email) => {
    try {
        return await userModel.getUserByEmail(email);
    } catch (error) {
        console.error('Error getting user:', error);
        throw new Error('Could not retrieve user');
    }
};


// Funktion för att autentisera användare
async function authenticateUser(email, password) {
    try {
        const user = await getUserByEmailAndPassword(email, password);
        
        if (user) {
            console.log('User authenticated successfully:', user);
            return user;
        } else {
            console.log('Invalid email or password.');
            return null;
        }
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw new Error('Could not authenticate user');
    }
}


async function updateUserName(email) {
    try {
        return await userModel.updateUserName(email);
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Could not update user');
    }
}


async function updateProfilePicture(email, profilePicture) {
    try {
        return await userModel.updateProfilePicture(email, profilePicture);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw new Error('Could not update profile picture');
    }
}


async function createAdmin(email, password, firstName, lastName) {
    try {
        // Generera verifieringskod
        const verificationCode = generateVerificationCode();

        // Hasha lösenordet
        const passwordHash = await hashPassword(password);

        // Skapa användaren i databasen
        await userModel.createAdminInDataBase(
            email,
            passwordHash,
            firstName,
            lastName,
            verificationCode
        );

        // Returnera verifieringskoden
        return verificationCode;
    } catch (error) {
        console.error('Error creating admin:', error);
        throw new Error('Could not create admin');
    }
}


async function setAdmin(user_id,is_admin) {
    try {
        return await userModel.setAdmin(user_id,is_admin);
    }
    catch (error){
        console.error('Error setting admin:', error);
        throw new Error('Could not set admin');
    }
}


async function getUserById(user_id) {
    try {
        return await userModel.getUserById(user_id);
    } catch (error) {
        console.error('Error getting user:', error);
        throw new Error('Could not retrieve user');
    }
}


async function changePassword(user_id, newPassword) {
    try {
        const passwordHash = await hashPassword(newPassword);

        return await userModel.changePassword(user_id, passwordHash);
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Could not change password');
    }
}


async function comparePasswords(provided, stored) {
    return await bcrypt.compare(provided, stored);
}


async function deactivateUser(userId, is_active) {
    try {
        return await userModel.deactivateUser(userId,is_active);
    } catch (error) {
        console.error('Error deactivating user:', error);
        throw new Error('Could not deactivate user');
    }
}

module.exports = {
    createUser,
    verifyUser,
    getUserByEmail,
    authenticateUser,
    updateUserName,
    updateProfilePicture,
    createAdmin,
    updateEmail,
    getAllUsers,
    setAdmin,
    getUserById,
    changePassword,
    comparePasswords,
    deactivateUser
};
