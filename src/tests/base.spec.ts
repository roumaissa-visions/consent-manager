import mongoose from "mongoose";

before(async function () {
  console.log(process.env.MONGO_URI_TEST);
  await mongoose.connect(process.env.MONGO_URI_TEST);
  await mongoose.connection.db.dropDatabase();
});

after(async function () {
  console.log(process.env.MONGO_URI_TEST);
  await mongoose.connection.close();
});
