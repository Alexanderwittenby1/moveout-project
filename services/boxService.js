const mysql = require('mysql2/promise');
const config = require('../config/db/moveout.json');
const { getUserByEmail } = require('./userService');
const db = mysql.createPool(config);


const boxService = {

    // Funktion för att skapa en ny låda
    createBox: async (user_id, box_name, content, label, audio_file_url = null, picture_file_url = null, background, visibility, pin ) => {
        try {
            const query = `INSERT INTO Boxes (user_id, box_name, content, label_design, audio_file_url, picture_file_url, background , visibility, pin)
                        VALUES (?, ?, ?, ?, ?, ? ,? , ?, ?)`;
            let res = await db.query(query, [user_id, box_name, content, label, audio_file_url, picture_file_url , background, visibility, pin ]);

            return res[0];
        } catch (err) {
            console.error('Error in createBox:', err);
            throw new Error('Failed to create box');
        }
    },

    // Funktion för att hämta alla lådor för en användare
    getUserBoxes: async (user_id) => {
        try {
            const query = `SELECT * FROM Boxes WHERE user_id = ?`;
            const [rows] = await db.query(query, [user_id]);
            return rows;
        } catch (err) {
            console.error('Error in getUserBoxes:', err);
            throw new Error('Failed to fetch user boxes');
        }
    },

    getBoxById: async (box_id) => {
        try {
            const query = `SELECT * FROM Boxes WHERE box_id = ?`;
            const [rows] = await db.query(query, [box_id]);
            return rows[0];
        } catch (err) {
            console.error('Error in getBoxbyId:', err);
            throw new Error('Failed to fetch box');
        }
    },

    getBoxesByUserId: async (userId) => {
    try {
        const query = `SELECT * FROM Boxes WHERE user_id = ?`;
        const boxes = await db.query(query, [userId]);
        return boxes;
    } catch (err) {
        console.error('Error in getBoxesByUserId:', err);
        throw new Error('Failed to get boxes');
    }
    },

    // Funktion för att lägga till saker i en låda

    setBoxPictureUrl: async (user_id, box_id, picture_file_url) => {
        try {
            const query = `UPDATE Boxes SET picture_file_url = ? WHERE user_id = ? AND box_id = ?`;
            const [results] = await db.query(query, [user_id, box_id, picture_file_url]);
            return results;
        }catch (error){
            console.error('Error updating box picture:', error);
            throw new Error('Could not update box picture');
        }
    },

    getAllBoxes: async () => {
        try {
            const query = `SELECT * FROM Boxes`;
            const [rows] = await db.query(query);
            return rows;
        } catch (err) {
            console.error('Error in getAllBoxes:', err);
            throw new Error('Failed to fetch all boxes');
        }
    },


    getboxByOwner: async () => {
        try {
            const query = `SELECT 
                    Boxes.box_id, 
                    Boxes.box_name, 
                    Users.user_id, 
                    Users.first_name, 
                    Users.last_name 
                FROM 
                    Boxes 
                JOIN 
                    Users 
                ON 
                    Boxes.user_id = Users.user_id;`;
            const [rows] = await db.query(query);
            return rows;
        } catch (err) {
            console.error('Error in getboxByOwner:', err);
            throw new Error('Failed to fetch boxes by owner');
        }
    },

    generatePin: () => {
        return Math.floor(100000 + Math.random() * 900000).toString(); // Generera ett 6-siffrigt nummer
    },

    shareBox: async (boxId, userId) => {
        const query = 'INSERT INTO BoxShares (box_id, user_id) VALUES (?, ?)';
        await db.query(query, [boxId, userId]);
    },

    getUserByEmail: async (email) => {
        try {
            const query = `SELECT * FROM Users WHERE email = ?`;
            const [rows] = await db.query(query, [email]);
            return rows[0];
        } catch (err) {
            console.error('Error in getUserByEmail:', err);
            throw new Error('Failed to fetch user by email');
        }
    },

    userHasAccess: async (boxId, userId) => {
        const query = 'SELECT * FROM BoxShares WHERE box_id = ? AND user_id = ?';
        const [rows] = await db.query(query, [boxId, userId]);
        return rows.length > 0;
    }
};

module.exports = boxService;
