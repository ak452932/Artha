const express = require('express');
const connectDB = require('./db/connectdb');
const studentRoutes = require('./routes/User');
const nodemailer=require('nodemailer');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const jobRoutes = require('./routes/jobroutes');

const cron=require('node-cron');
const {fetchJobs }= require('./Controllers/jobController');

app.use(cors());
const PORT = process.env.PORT || 8000;
app.use(bodyParser.json());
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const DATABASE_URL = 'mongodb+srv://ak452932:dtsQGKsqofJpPUBA@cluster0.64ixf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
//mongodb+srv://username:my@pass@cluster.mongodb.net/db
// Middleware to parse JSON requests

cron.schedule('0 */15 * * * *', () => {
  fetchJobs({}, { status: () => ({ json: () => {} }) });
  console.log('⏰ Job feeds updated every 15 minutes');
});




connectDB(DATABASE_URL)
app.use(express.json());






app.use('/', studentRoutes);

// Nodemailer setup
//const scheduler = require('node-cron');


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});