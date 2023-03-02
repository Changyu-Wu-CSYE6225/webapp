// Generate file name
const crypto = require('crypto');

module.exports = generateRandomFileName = () => {
    crypto.randomBytes(16).toString('hex');
};