const mongoose = require("mongoose");

const userGroupSchema = new mongoose.Schema(
  {
    groupName: {
      type: String,
      // required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Refers to the `userModel` collection
        // required: true,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically manages `createdAt` and `updatedAt`
  }
);

const userGroupsModel = mongoose.model("UserGroup", userGroupSchema);

module.exports = { userGroupsModel };
