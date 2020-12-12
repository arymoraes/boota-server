import mongoose from 'mongoose';

// Connecting to mongoDB
export const mongooseConnection = async (): Promise<void> => {
  await mongoose.connect(process.env.MONGO_DB, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB!');
};
