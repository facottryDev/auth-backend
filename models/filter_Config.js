import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    filterID: {
      type: Number,
      required: true,
    },

    appConfigID: {
      type: Number,
      required: true,
    },

    playerConfigID: {
      type: Number,
      required: true,
    },

    filter_OSname: {
      type: String,
      required: true,
    },

    filter_OSver: {
      type: String,
      required: true,
    },

    filter_Country: {
      type: String,
      required: true,
    },

    filter_Subscription: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model.configs || mongoose.model("config", configSchema);
