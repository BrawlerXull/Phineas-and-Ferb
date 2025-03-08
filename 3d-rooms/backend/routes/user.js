const { Router } = require("express");
const bcrypt = require("bcrypt");
const zod = require("zod");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const auth = require("../middleware/auth");
require("dotenv").config();
const { userModel } = require("../models/userModel");
const { userGroupsModel } = require("../models/userGroupsModels");
const { jwt_secret_user } = require("../config");
const userRouter = Router();

//  Zod for validation
const signupSchema = zod.object({
  email: zod.string().email("Invalid email format"),
  password: zod.string().min(6, "Password must be at least 6 characters long"),
  userName: zod.string().nonempty("Username is required"),
});

// Signup endpoint
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password, userName } = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    await userModel.create({
      email,
      password: hashedPassword,
      userName,
    });

    res.status(201).json({
      message: "Signup succeeded",
    });
  } catch (err) {
    if (err instanceof zod.ZodError) {
      return res.status(400).json({
        message: "Validation failed",
        errors: err.errors,
      });
    }
    console.error(err);
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

userRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({
    message: "Successfully logged out",
  });
});

// Signin endpoint
userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "12h",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set secure flag in production
      maxAge: 3600000, // Token expiration time (1 hour)
    });

    return res.status(200).json({
      message: "Sign in successful",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/createUserGroup", auth, async (req, res) => {
  try {
    const { groupName, userIds, authenticatedUserId } = req.body;

    // Debugging: Log incoming data
    console.log("Received groupName:", groupName);
    console.log("Received userIds:", userIds);

    // Validate input
    if (!groupName || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    // Extract the authenticated user's ID from the `auth` middleware
    // const authenticatedUserId = req.user.id;

    // Add the authenticated user to the group if not already included
    if (!userIds.includes(authenticatedUserId)) {
      userIds.push(authenticatedUserId);
      console.log(authenticatedUserId)
    }

    // Create the group with all members
    const newGroup = await userGroupsModel.create({
      groupName,
      members: userIds,
    });

    res.status(201).json({
      message: "Group created successfully",
      group: newGroup,
    });
  } catch (err) {
    console.error("Error creating group:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET route to viewAllUsers //
userRouter.get("/viewAllUsers", auth, async (req, res) => {
  try {
    const users = await userModel.find({}, "-password");

    res.status(200).json({
      message: "Users retrieved successfully",
      users,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/removeUserFromGroup", auth, async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      return res
        .status(400)
        .json({ message: "User ID and Group ID are required" });
    }

    // Fetch the group
    const group = await userGroupsModel.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is a member of the group
    if (!group.members.includes(userId)) {
      return res
        .status(400)
        .json({ message: "User is not a member of this group" });
    }

    // Remove the user from the group
    group.members = group.members.filter(
      (member) => member.toString() !== userId
    );

    await group.save();

    res.status(200).json({
      message: "User removed from the group successfully",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// TO view past groups //
userRouter.post("/viewUserGroups", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Fetch groups associated with the given user_id and populate members
    const userGroups = await userGroupsModel
      .find({ members: userId })
      .populate("members"); // Populate members with their ID and name

    if (userGroups.length === 0) {
      return res.status(404).json({
        message: "No groups found for the specified user",
      });
    }

    res.status(200).json({
      message: "Past groups retrieved successfully",
      groups: userGroups,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

userRouter.post("/addUserToGroup", auth, async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    if (!userId || !groupId) {
      return res
        .status(400)
        .json({ message: "User ID and Group ID are required" });
    }

    // Fetch the group
    const group = await userGroupsModel.findById(groupId).populate("members");

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Check if the user is already a member
    if (group.members.some((member) => member._id.toString() === userId)) {
      return res
        .status(400)
        .json({ message: "User is already a member of this group" });
    }

    // Add the user to the group
    group.members.push(userId);
    await group.save();

    res.status(200).json({
      message: "User added to the group successfully",
      group,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

//Route to delete the userGroups //
// Delete user group endpoint
userRouter.delete("/deleteGroup", auth, async (req, res) => {
  try {
    const { id } = req.body;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid group ID" });
    }

    // Check if the group exists
    const group = await userGroupsModel.findById(id);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Delete the group
    await userGroupsModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Group deleted successfully" });
  } catch (err) {
    console.error("Error deleting group:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = { userRouter };
