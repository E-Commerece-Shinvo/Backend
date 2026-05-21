import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce')
  .then(async () => {
    const orders = await mongoose.connection.db.collection('orders').find({}).sort({createdAt: -1}).limit(1).toArray();
    console.log("RECENT ORDER:", orders[0] ? orders[0]._id : "None");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
