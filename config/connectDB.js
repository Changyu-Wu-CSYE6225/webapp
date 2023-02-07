const mysql = require('mysql2');

const db = mysql.createPool({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: process.env.MYSQL_PASSWORD || 'Vandark-1999',
    database: 'csye6225-webapp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = db.promise();