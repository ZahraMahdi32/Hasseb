const mongoose = require("mongoose");

const BusinessDataSchema = new mongoose.Schema(
  {
    // 📌 ربط مباشر بصاحب البيانات
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Owner",
      required: true
    },

    // اختياري: عشان تربطينه بسهولة من الـ username
    username: { type: String },

    businessName: { type: String, default: "My Business" },

    // منتجات
    products: [
      {
        name: String,
        cost: Number,
        price: Number
      }
    ],

    // تكاليف ثابتة
    fixedCost: { type: Number, default: 0 },

    // كاش فلو
    cashFlow: [
      {
        month: String,
        revenue: Number,
        expenses: Number,
        netCashFlow: Number
      }
    ],

    // سيناريوهات التسعير
    pricingScenarios: [
      {
        scenario: String,   // مثل "Base" / "High Price" / "Low Price"
        price: Number,
        units: Number,
        revenue: Number,
        variableCost: Number,
        cm: Number,
        profit: Number
      }
    ],

    fileName: String,
    fileSize: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("BusinessData", BusinessDataSchema);
