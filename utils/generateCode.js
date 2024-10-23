/**
 * Genererar en slumpmässig 4-siffrig verifieringskod.
 * @returns {string} En 4-siffrig kod som sträng
 */
const generateVerificationCode = () => {
    // Generera ett heltal mellan 1000 och 9999
    const code = Math.floor(1000 + Math.random() * 9000);
    console.log('Generated verification code: ', code);
    return code.toString();
};

// Exportera funktionen
module.exports = {
    generateVerificationCode,
};


