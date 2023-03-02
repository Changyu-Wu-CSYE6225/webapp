// Generate file name
const crypto = require('crypto');

module.exports = generateRandomFileName = () => {
    return crypto.randomBytes(16).toString('hex');
};