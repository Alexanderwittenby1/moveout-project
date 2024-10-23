const mysql = require('mysql2/promise'); // Använd mysql2 med promise
const config = require('../config/db/moveout.json');

const bcrypt = require('bcrypt');

// Skapa en databasanslutning
const db = mysql.createPool(config); // Skapa en pool med promise

// Funktion för att skapa en användare
const createUser = async (email, passwordHash, firstName, lastName, verificationCode) => {
    try {
        const checkQuery = 'SELECT * FROM users WHERE email = ?';
        const [existingUsers] = await db.query(checkQuery, [email]);

        if (existingUsers.length > 0) {
            throw new Error('User already exists');
        }


        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, verification_code, is_verified)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const values = [email, passwordHash, firstName, lastName, verificationCode, false];
        const [results] = await db.query(query, values);
        return results;
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
};

const setAdmin = async (user_id, is_admin) => { 
    try {
        const query = 'UPDATE users SET is_admin = ? WHERE user_id = ?';
        const [results] = await db.query(query, [is_admin, user_id]);
        return results.affectedRows > 0;
    } catch (error) {
        console.error('Error setting admin:', error);
        throw new Error('Could not set admin');
    }
}

const getAllUsers = async () => {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        return rows;
    }
    catch (error) {
        console.error('Error getting all users:', error);
        throw new Error('Could not retrieve users');
    }
};


const getUserByGoogleId = async (googleId) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE google_id = ?', [googleId]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user by Google ID:', error);
        throw new Error('Could not fetch user');
    }
};

const loginUserWithGoogle = async (googleId, name, email, verified, profilePicture) => {
    try {
        const user = await getUserByGoogleId(googleId);
        if (user) {
            return user;
        } else {
            const query = `
                INSERT INTO users (google_id, first_name, email, is_verified, profile_picture)
                VALUES (?, ?, ?, ?, ?)
            `;
            const values = [googleId, name, email, verified, profilePicture];
            const [results] = await db.query(query, values);
            return results;
        }
    } catch (error) {
        console.error('Error logging in user with Google:', error);
        throw new Error('Could not log in user');
    }

};

const updateEmail = async (email, newEmail) => {
    try {
        const query = 'UPDATE users SET email = ? WHERE email = ?';
        const [results] = await db.query(query, [newEmail, email]);
        return results;
    } catch (error) {
        console.error('Error updating email:', error);
        throw new Error('Could not update email');
    }
}

// Funktion för att hämta en användare baserat på e-post och lösenord
const login = async (email, password) => {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // Ingen användare med det angivna e-postadressen hittades
            return null;
        }
        
        const user = rows[0];
        
        
        // Jämför det angivna lösenordet med det hashade lösenordet i databasen
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (isMatch) {
            // Lösenordet matchar
            console.log('User:', user);
            return user;
        } else {
            // Lösenordet matchar inte
            return null;
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        throw new Error('Could not fetch user');
    }
};

// Funktion för att uppdatera användarens verifieringsstatus
const updateUserVerificationStatus = async (email, isVerified) => {
    try {
        const query = 'UPDATE users SET is_verified = ? WHERE email = ?';
        const [results] = await db.query(query, [isVerified, email]);
        return results;
    } catch (error) {
        console.error('Error updating verification status:', error);
        throw new Error('Could not update verification status');
    }
};


// Funktion för att hämta en användare baserat på e-post
async function getUserByEmail(email) {
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error fetching user by email:', error);
        throw new Error('Could not fetch user');
    }
}


async function updateUserName(email) {

    try {
        const query = 'UPDATE users SET first_name = ? WHERE email = ?';
        const [results] = await db.query(query, [firstName, email]);
        return results;
    } catch (error) {
        console.error('Error updating user:', error);
        throw new Error('Could not update user');
    }
    
}


async function updateProfilePicture(email, profilePicture) {
    try {
        const query = 'UPDATE users SET profile_picture = ? WHERE email = ?';
        const [results] = await db.query(query, [profilePicture, email]);
        return results;
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw new Error('Could not update profile picture');
    }

}


async function createAdminInDataBase(email,passwordHash,firstName,lastName,verificationCode){
    try {
        const query = `
            INSERT INTO users (email, password_hash, first_name, last_name, verification_code, is_verified, is_admin)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [email, passwordHash, firstName, lastName, verificationCode, true, true];
        const [results] = await db.query(query, values);
        return results;
    } catch (err) {
        console.error('Error creating user:', err);
        throw err;
    }
}


async function getUserById(user_id) {
    try {
        const query = 'SELECT * FROM users WHERE user_id = ?';
        const [rows] = await db.query(query, [user_id]);
        return rows[0];

    }
    catch (error) {
        console.error('Error getting user by id:', error);
        throw new Error('Could not retrieve user');
    
    }
}

async function changePassword(user_id, newPassword) { 
    try {
        
        const query = 'UPDATE users SET password_hash = ? WHERE user_id = ?';
        const [results] = await db.query(query, [newPassword, user_id]);
        return results;
    } catch (error) {
        console.error('Error changing password:', error);
        throw new Error('Could not change password');
    }
}



module.exports = {
    createUser,
    login,
    updateUserVerificationStatus,
    getUserByEmail,
    updateUserName,
    updateProfilePicture,
    createAdminInDataBase,
    updateEmail,
    getUserByGoogleId,
    loginUserWithGoogle,
    getAllUsers,
    setAdmin,
    getUserById,
    changePassword
};
