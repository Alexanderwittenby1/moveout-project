const bcrypt = require('bcrypt');
const saltRounds = 13; // Antal saltvarv

/**
 * Hashar ett lösenord
 * @param {string} password - Lösenordet som ska hashats
 * @returns {Promise<string>} - Ett hashat lösenord
 */
const hashPassword = async (password) => {
    try {
        // Hasha lösenordet med bcrypt
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error('Error hashing password:', error);
        throw new Error('Could not hash password');
    }
};

/**
 * Verifierar ett lösenord mot ett hashat lösenord
 * @param {string} password - Lösenordet som ska verifieras
 * @param {string} hashedPassword - Det hashade lösenordet
 * @returns {Promise<boolean>} - Om lösenordet matchar det hashade lösenordet
 */
const verifyPassword = async (password, hashedPassword) => {
    try {
        // Jämför lösenordet med det hashade lösenordet
        const match = await bcrypt.compare(password, hashedPassword);
        console.log('Password match:', match);
        return match;
    } catch (error) {
        console.error('Error verifying password:', error);
        throw new Error('Could not verify password');
    }
};

module.exports = {
    hashPassword,
    verifyPassword,
};
