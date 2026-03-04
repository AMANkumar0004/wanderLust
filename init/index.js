require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const dbUrl = process.env.ATLASDB_URL;

main()
  .then(() => {
    console.log("connected to DB");
    initDB();
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const initDB = async () => {
  await Listing.deleteMany({});

  // Add default geometry and category so schema validation passes
  const dataWithDefaults = initData.data.map((obj) => ({
    ...obj,
    geometry: {
      type: "Point",
      coordinates: [0, 0], // placeholder coordinates
    },
    category: "trending",
  }));

  await Listing.insertMany(dataWithDefaults);
  console.log("✅ Data was initialized successfully!");
  mongoose.connection.close();
};
