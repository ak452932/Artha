const mongoose = require('mongoose');
const  connectDB = async (DATABASE_URL) => {
    try {
       const DB_OPTIONS = {
            dbName: 'ServiceHub', // Specify your database name here
        };
        await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
       // process.exit(1); // Exit the process with failure
    }
}
module.exports = connectDB;