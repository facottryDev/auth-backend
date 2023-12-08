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

    homepage_object: {
      type: Object,
    },

    detailpage_object: {
      type: Object,
    },

    settings_object: {
      type: Object,
    },

    player_object: {
      type: Object,
    },

    player_array: {
      type: Array,
    },
  },
  { timestamps: true }
);

export default mongoose.model.configs || mongoose.model("config", configSchema);
