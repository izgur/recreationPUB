const mongoose = require("mongoose");

const sportsSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: [true, "Sport name is required!"] },
  category: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length > 0,
      message: "At least one category is required!",
    },
  },
});

mongoose.model("Sport", sportsSchema, "Sports");