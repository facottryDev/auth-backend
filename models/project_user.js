import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    user_email: {
      type: String,
      required: true,
    },

    user_role: {
      type: String,
      required: true,
    },

    project_name: {
      type: String,
      required: true,
    },

    projectID: {
      type: Number,
      required: true,
    },

    env_type: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model.project_users ||
  mongoose.model("project_user", userSchema);
