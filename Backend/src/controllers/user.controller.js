import User from "../models/user.model.js";
import { getOnlineUserIds } from "../config/socket.js";

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  fullName: user.name,
  email: user.email,
  phoneNumber: user.phoneNumber,
  avatar: user.avatar,
  profilePic: user.avatar,
  googleId: user.googleId,
  isVerified: user.isVerified,
  isOnline: false,
  lastSeenAt: user.lastSeenAt,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const getCurrentUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const onlineUsers = new Set(getOnlineUserIds());

    return res.status(200).json({
      ...sanitizeUser(req.user),
      isOnline: onlineUsers.has(String(req.user._id)),
    });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getContacts = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const currentUserId = req.user._id;
    const removedFriendIds = req.user.removedFriendIds || [];
    const onlineUsers = new Set(getOnlineUserIds());

    const users = await User.find({
      _id: { $ne: currentUserId, $nin: removedFriendIds },
    })
      .select("-password -verificationOtp -verificationOtpExpiresAt -passwordResetToken -passwordResetExpiresAt")
      .sort({ name: 1 });

    return res.status(200).json(
      users.map((user) => ({
        ...sanitizeUser(user),
        isOnline: onlineUsers.has(String(user._id)),
      }))
    );
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const removeFriend = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const { id: friendId } = req.params;

    if (!friendId || friendId === String(req.user._id)) {
      return res.status(400).json({ message: "Invalid friend id" });
    }

    const friend = await User.findById(friendId).select("_id");
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { removedFriendIds: friend._id },
    });

    return res.status(200).json({ message: "Friend removed" });
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const serializeUser = sanitizeUser;
