const dotenv = require("dotenv").config();      // Load .env file
const express = require('express');
const userRouter = require('./routes/userRoute');
const errorHandler = require('./middleware/errorMiddleware');

// Create a server
const app = express();


// Middleware
app.use(express.json());
// app.use(cors());

// Routes
app.get('/healthz', (req, res) => res.send('Healthy Server'));
app.use('/v1/user', userRouter);

app.use(errorHandler);


// PORT
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`Server on port ${PORT}`);
});


module.exports = app;