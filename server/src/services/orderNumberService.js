const Counter = require("../models/Counter");

const generateOrderNumber = async () => {
  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { value: 1 } },
    {
      returnDocument: "after",
      upsert: true,
    }
  );

  return `AKM-${counter.value}`;
};

module.exports = {
  generateOrderNumber,
};