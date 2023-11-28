const mongoose = require("mongoose");

let dbURI = "mongodb://127.0.0.1/Sports";
if (process.env.NODE_ENV === "production")
  dbURI = process.env.MONGODB_ATLAS_URI;
else if (process.env.NODE_ENV === "test")
  dbURI = "mongodb://127.0.0.1/Sports"; //"mongodb://sports-mongo-db/Demo";
mongoose.connect(dbURI);

mongoose.connection.on("connected", () =>
  console.log(`Mongoose connected to ${dbURI.replace(/:.+?@/, ":*****@")}.`)
);

mongoose.connection.on("error", (err) =>
  console.log(`Mongoose connection error: ${err}.`)
);

mongoose.connection.on("disconnected", () =>
  console.log("Mongoose disconnected")
);

const gracefulShutdown = async (msg, callback) => {
  await mongoose.connection.close();
  console.log(`Mongoose disconnected through ${msg}.`);
  callback();
};

process.once("SIGUSR2", () => {
  gracefulShutdown("nodemon restart", () =>
    process.kill(process.pid, "SIGUSR2")
  );
});

process.on("SIGINT", () => {
  gracefulShutdown("app termination", () => process.exit(0));
});

process.on("SIGTERM", () => {
  gracefulShutdown("Cloud-based app shutdown", () => process.exit(0));
});

require("./locations");
require("./users");
require("./sports");
require("./events");