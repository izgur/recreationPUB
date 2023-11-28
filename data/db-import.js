const fs = require("fs");
const mongoose = require("mongoose");

let comments = [
  {
    name: "Celje - Celjski grad",
    comments: [
      {
        _id: { $oid: new mongoose.mongo.ObjectId() },
        author: "Dejan Lavbič",
        rating: 5,
        comment: "Odlična lokacija, ne morem je prehvaliti.",
        createdOn: { $date: "2010-04-04T00:00:00Z" },
      },
      {
        _id: { $oid: new mongoose.mongo.ObjectId() },
        author: "Vladimir Putin",
        rating: 2,
        comment:
          "Čisti dolgčas, še kava je zanič. Edina svetla točka je razstava mučilnih naprav.",
        createdOn: { $date: "2016-07-30T00:00:00Z" },
      },
    ],
  },
  {
    name: "Ljubljana - Cankarjeva spominska soba na Rožniku",
    comments: [
      {
        _id: { $oid: new mongoose.mongo.ObjectId() },
        author: "Ivan Cankar",
        rating: 4,
        comment: "Nič ni več tako kot je bilo.",
        createdOn: { $date: "1918-12-11T00:00:00Z" },
      },
    ],
  },
];

let locations = fs
  .readFileSync("./kulturne-dediscine.csv", "utf8")
  .split("\r\n")
  .filter((v) => v.length > 0 && v.indexOf("ESD") == -1)
  .map((x) => {
    let row = "",
      split = false;
    for (const element of x) {
      split = element == '"' ? !split : split;
      row += element == "," && !split ? "|" : element;
    }
    row = row.replace(/"/g, "").replace(/\s+/g, " ").split("|");
    let y = {
      _id: { $oid: new mongoose.mongo.ObjectId() },
      id: parseInt(row[0], 10),
      name: row[1],
      category: row[3],
      type: row[4],
      sports: row[5].split(", "),
      description: row[6],
      location: row[9],
      institution: row[11],
      heritage: row[12],
      municipality: row[13],
      coordinates: [parseFloat(row[17]), parseFloat(row[16])],
    };
    if (row[2].length > 0) y.synonyms = row[2].split(", ");
    if (row[7].length > 0) y.datation = row[7];
    if (row[8].length > 0) y.authors = row[8];
    if (row[10].length > 0) y.fields = row[10].split(", ");
    let comment = comments.find((v) => v.name == y.name);
    if (comment) {
      let averageRating = 0;
      averageRating = parseInt(
        comment.comments.reduce((acc, { rating }) => {
          return acc + rating;
        }, 0) / comment.comments.length,
        10
      );
      y.comments = comment.comments;
      y.rating = averageRating;
    }
    return y;
  });

fs.writeFileSync(
  "./kulturne-dediscine.json",
  JSON.stringify(locations, null, 2)
);
