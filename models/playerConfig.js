import mongoose from "mongoose";

const configSchema = new mongoose.Schema(
  {
    filterID: {
      type: Number,
      required: true,
    },

    playerConfigID: {
      type: Number,
      required: true,
    },

    controls: {type: Boolean, required: true},

    show_ads: {type: Boolean, required: true},

    thumbnail: {type: Boolean, required: true},

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
