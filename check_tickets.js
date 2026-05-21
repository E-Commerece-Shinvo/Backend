import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    const tickets = await mongoose.connection.db.collection('supporttickets').find({}).toArray();
    console.log("ALL TICKETS:", tickets);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
