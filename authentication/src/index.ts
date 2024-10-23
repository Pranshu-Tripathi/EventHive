import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  try {
    await mongoose.connect(
      "mongodb://authentication-mongo-srv:27017/authentication"
    );
    console.log("Auth Service: Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
};

app.listen(3000, () => {
  console.log("AUTH SERVICE: PORT:3000");
});

start();
