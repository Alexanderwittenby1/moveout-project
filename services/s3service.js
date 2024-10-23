const {S3} = require('aws-sdk');
const boxService = require('./boxService');
const uuid = require('uuid').v4;
exports.uploadFile = async (file) => {
    const s3 = new S3();
    const params = {
        Bucket: 'moveout-project',
        Key: `avatars/${uuid()}-${file.originalname}`,
        Body: file.buffer,
    };
    return await s3.upload(params).promise();
}

exports.uploadAudio = async (buffer, fileName) => {
    const s3 = new S3();
    const params = {
        Bucket: 'moveout-project',
        Key: `audio/${uuid()}-${fileName.originalname}`,
        Body: buffer,
        ContentType: 'audio/mpeg'
    };
    console.log("Uploading audio to S3:", params);
    return await s3.upload(params).promise();
}

exports.uploadPhoto = async (base64Image, fileName) => {
    const s3 = new S3();

    // Convert base64 to buffer
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');
    
    const params = {
        Bucket: 'moveout-project',
        Key: `photos/${uuid()}-${fileName}`, 
        Body: buffer,
        ContentEncoding: 'base64',  
        ContentType: 'image/jpeg',  
    };

    try {
        const result = await s3.upload(params).promise();
        console.log('Photo upload successful:', result);
        return result;  
    } catch (error) {
        console.error('Error uploading photo:', error);
        throw error;  
    }
};

// Funktioner för att spara datan i databasen

// Funktion för att spara bilder i databasen som URL, bilderna representerar lådorna.
async function setpicture_file_url(user_id,box_id, url) {
    try {
        return await boxService.setBoxPictureUrl(user_id, box_id, url);
    } catch (error) {
        console.error('Error updating profile picture:', error);
        throw new Error('Could not update profile picture');
    }
}
 
exports.setpicture_file_url = setpicture_file_url;