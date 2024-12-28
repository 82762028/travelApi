import mongoose from 'mongoose';

const connectToDatabase = async () => {
    
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URL)
        console.log("Connected to database:", connection.connection.name);
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
};

export default connectToDatabase;
