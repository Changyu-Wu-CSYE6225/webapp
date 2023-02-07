const dotenv = require("dotenv").config();      // Load .env file
const express = require('express');
const userRouter = require('./routes/userRoute');
const productRouter = require('./routes/productRoute');
const errorHandler = require('./middleware/errorMiddleware');
const db = require("./database/initDB");

// Create a server
const app = express();


// Middleware
app.use(express.json());
// app.use(cors());

// Routes
app.get('/healthz', (req, res) => res.send('Healthy Server'));
app.use('/v1/user', userRouter);
app.use('/v1/product', productRouter);

app.use(errorHandler);


// Connect to database and port
const PORT = process.env.PORT || 5001;
const DROP_AND_SYNC = process.env.NODE_ENV === 'development' ? false : true;
db.sequelize.sync({ force: DROP_AND_SYNC })     // Set to false only on development environment
    .then(() => {
        console.log("Drop and re-sync db succeed");
        app.listen(PORT, () => {
            console.log(`Server on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.log("Connect to database failed");
    });


module.exports = app;