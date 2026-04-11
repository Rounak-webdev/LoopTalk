import mongoose from "mongoose";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { emitToUser, getOnlineUserIds } from "../config/socket.js";

let cloudinaryUploadsDisabled = false;

const uploadWithFallback = async ({ dataUrl, uploadOptions, fallbackValue }) => {
  if (!dataUrl) return fallbackValue || "";

  if (cloudinaryUploadsDisabled) {
    return fallbackValue || dataUrl;
  }

  try {
    const uploadResponse = await cloudinary.uploader.upload(dataUrl, uploadOptions);
    return uploadResponse.secure_url;
  } catch (error) {
    console.error("ERROR:", error);

    if (error?.http_code === 401 || /invalid signature/i.test(error?.message || "")) {
      cloudinaryUploadsDisabled = true;
      console.warn("Cloudinary uploads disabled for this server process. Falling back to inline media.");
    }

    return fallbackValue || dataUrl;
  }
};

const uploadAttachment = async (file) => {
  if (!file?.dataUrl) return null;

  return {
    fileName: file.name || "",
    fileSize: file.size || 0,
    fileType: file.type || "",
    fileUrl: await uploadWithFallback({
      dataUrl: file.dataUrl,
      uploadOptions: {
        folder: "looptalk/messages",
        resource_type: "auto",
      },
      fallbackValue: file.dataUrl,
    }),
  };
};

export const getUsersForSidebar = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    if (!myId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!mongoose.Types.ObjectId.isValid(userToChatId)) {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json(messages);
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, file } = req.body;
    const receiverId = req.params.id || req.body.receiverId;
    const senderId = req.user._id;

    if (process.env.DEBUG_MESSAGES === "true") {
      console.log("BODY:", req.body);
      console.log("USER:", req.user);
    }

    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid receiver id" });
    }

    if (!text?.trim() && !image && !file?.dataUrl) {
      return res.status(400).json({ message: "Message content is required" });
    }

    let imageUrl = "";
    let attachment = null;

    if (image) {
      imageUrl = await uploadWithFallback({
        dataUrl: image,
        uploadOptions: {
          folder: "looptalk/images",
        },
        fallbackValue: image,
      });
    }

    if (file?.dataUrl) {
      attachment = await uploadAttachment(file);
    }

    const deliveredAt = getOnlineUserIds().includes(receiverId) ? new Date() : null;

    const newMessage = new Message({
      senderId,
      receiverId,
      text: text?.trim() || "",
      image: imageUrl,
      ...attachment,
      deliveredAt,
    });

    await newMessage.save();

    emitToUser(String(receiverId), "message:new", newMessage);
    emitToUser(String(senderId), "message:new", newMessage);

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
