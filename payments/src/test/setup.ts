import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.mock("../nats-wrapper");

let mongo: MongoMemoryServer;

declare global {
  var signup: (_id?: string) => string[];
}

beforeAll(async () => {
  process.env.JWT_KEY = "lkjh";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.signup = (_id?: string) => {
  const email = "test@test.com";
  const id = _id || new mongoose.Types.ObjectId().toHexString();

  // Build a JWT payload. { id, email }
  const payload = {
    id,
    email,
  };

  // Create the JWT!
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session Object
  const session = { jwt: token };

  // Turn that session into JSON

  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString("base64");
  // return a string thats the cookie with the encoded data
  return [`session=${base64}`];
};
