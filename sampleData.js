const SampleData = require("./models/SampleData");
const { v4: uuidv4 } = require("uuid");
const sampleData = require("./data.js");

const pop = async () => {
  for (let i = 0; i < sampleData.length; i++) {
    let sample = sampleData[i];
    console.log(`Inserting ${i}`);
    let newSampleData = new SampleData({
      _id: uuidv4(),
      amountMin: Number(sample["prices.amountMin"]),
      amountMax: Number(sample["prices.amountMax"]),
      availability: sample["prices.availability"],
      condition: sample["prices.condition"],
      currency: sample["prices.currency"],
      dateSeen: sample["prices.dateSeen"],
      dateUpdated: new Date(sample["prices.dateUpdated"]),
      isSale: sample["prices.isSale"],
      merchant: sample["prices.merchant"],
      shipping: sample["prices.shipping"],
      sourceURLs: sample["prices.sourceURLs"],
      asins: sample["asins"],
      brand: sample["brand"],
      categories: sample["categories"],
      dateAdded: sample["dateAdded"],
      dateUpdated: sample["dateUpdated"],
      imageURLs: sample["imageURLs"],
      keys: sample["keys"],
      manufacturer: sample["manufacturer"],
      manufacturerNumber: sample["manufacturerNumber"],
      name: sample["name"],
      primaryCategories: sample["primaryCategories"],
      sourceURLs: sample["sourceURLs"],
      upc: sample["upc"],
      weight: sample["weight"],
    });

    await newSampleData
      .save()
      .then((returned) => console.log(`Saved ${i}`))
      .catch((err) => console.log(err.messafe));
  }
};

// pop();
