const { comparePassword, hashPassword } = require("../helpers/authHelper.js")
const orderModel = require("../models/orderModel.js")
const userModel = require("../models/userModel.js")
const JWT = require("jsonwebtoken")

const registerController = async (req, res) => {
  try {
    const { name, email, password, phone, question } = req.body
    //validation
    if (!name) {
      return res.send({ error: "Name is required" })
    }
    if (!email) {
      return res.send({ error: "Email is required" })
    }
    if (!password) {
      return res.send({ error: "Password is required" })
    }
    if (!phone) {
      return res.send({ error: "phone is required" })
    }
    if (!question) {
      return res.send({ error: "question is required" })
    }
    //check user
    const existingUser = await userModel.findOne({ email })
    //existing user
    if (existingUser) {
      return res.status(200).send({
        success: true,
        message: "already  register please login",
      })
    }
    //register user

    const hashedPassword = await hashPassword(password)
    //save
    const user = await new userModel({
      name,
      email,
      password: hashedPassword,
      phone,
      question,
    }).save()
    res.status(201).send({
      success: true,
      message: "user has been registered successfully",
      user,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error while registration",
      error,
    })
  }
}

registerController

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res
        .status(404)
        .send({ success: false, message: "invalid email  or password" })
    }
    const user = await userModel.findOne({ email }).populate("dynamicRole")
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "email not found",
      })
    }
    const match = await comparePassword(password, user.password)
    if (!match)
      return res.status(200).send({
        success: false,
        message: "invalid password",
      })
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "5d",
    })
    res.status(200).send({
      success: true,
      message: "login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        dynamicRole: user.dynamicRole,
        subscription: user.subscription || false,
      },

      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: " Error in login",
      error,
    })
  }
}

const forgotPasswordController = async (req, res) => {
  try {
    const { email, question, newPassword } = req.body
    if (!email) {
      res.status(400).send({ message: "email is required" })
    }
    if (!question) {
      res.status(400).send({ message: "question is required" })
    }
    if (!newPassword) {
      res.status(400).send({ message: "new password is required" })
    }
    //check
    const user = await userModel.findOne({ email, question })
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "wrong email and question",
      })
    }
    const hashed = await hashPassword(newPassword)
    await userModel.findByIdAndUpdate(user._id, { password: hashed })
    res.status(200).send({
      success: true,
      message: "password updated successfully",
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "something went wrong",
      error,
    })
  }
}

const changePasswordController = async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body

    if (!email) {
      return res.status(400).send({ message: "Email is required" })
    }

    if (!oldPassword) {
      return res.status(400).send({ message: "Old password is required" })
    }

    if (!newPassword) {
      return res.status(400).send({ message: "New password is required" })
    }

    const user = await userModel.findOne({ email })

    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" })
    }

    const isMatch = await comparePassword(oldPassword, user.password)

    if (!isMatch) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid old password" })
    }

    const hashedNewPassword = await hashPassword(newPassword)
    await userModel.findByIdAndUpdate(user._id, {
      password: hashedNewPassword,
      version: user.version ? user.version + 1 : 1, // Incrementing the version field
    })

    // Create a new JWT token with the updated user version
    const token = JWT.sign(
      { _id: user._id, version: user.version },
      process.env.JWT_SECRET,
      {
        expiresIn: "5d",
      }
    )

    res.status(200).send({
      success: true,
      message: "Password has been changed successfully",
      token,
    })
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "Something went wrong",
      error,
    })
  }
}

const testController = (req, res) => {
  try {
    res.send("Protected Routes")
  } catch (error) {
    console.log(error)
    res.send({ error })
  }
}

const getAllUsersController = async (req, res) => {
  try {
    const { role } = req.query
    const query = { role: role || 0 }
    const users = await userModel.find(query)
    res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Error while fetching users",
      error,
    })
  }
}

const updateSubscriptionController = async (req, res) => {
  try {
    const { _id } = req.params

    // Find the user by their ID
    const user = await userModel.findById(_id)
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" })
    }

    // Update the subscription status to true
    user.subscription = !user.subscription

    // Save the updated user document
    await user.save()
    const subscriptionStatus = user.subscription ? "active" : "inactive"
    const message = `Subscription status updated successfully. Subscription is now ${subscriptionStatus}.`

    res.json({
      success: true,
      message: message,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ success: false, message: "Internal server error" })
  }
}

// Define the route to get all users
const getAllUsers = async (req, res) => {
  try {
    // Fetch all users from the database
    const users = await userModel.find().populate("dynamicRole")

    res.status(200).json({
      success: true,
      users,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Error while fetching users",
      error,
    })
  }
}

const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id

    // Find the user by their ID
    const user = await userModel.findById(userId)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.status(200).json({
      success: true,
      user,
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({
      success: false,
      message: "Error while fetching the user",
      error,
    })
  }
}

const getOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({ buyer: req.user._id })
      .populate("movies", "-poster")
      .populate("buyer", "name")
    res.json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error while getting orders",
      error,
    })
  }
}

const getAllOrdersController = async (req, res) => {
  try {
    const orders = await orderModel
      .find({})
      .populate("movies", "-poster")
      .populate("buyer", "name")
      .sort({ createdAt: "-1" })
    res.json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error while getting orders",
      error,
    })
  }
}

const orderStatusController = async (req, res) => {
  try {
    const { orderId } = req.params
    const { status } = req.body
    const orders = await orderModel.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    )
    res.json(orders)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      success: false,
      message: "error while updating order status",
      error,
    })
  }
}

const addToWatchlistController = async (req, res) => {
  try {
    const { movieId, profileId } = req.body;
    const user = await userModel.findById(req.user._id);
    
    if (profileId) {
      const profile = user.profiles.id(profileId);
      if (profile) {
        if (!profile.watchlist.includes(movieId)) {
          profile.watchlist.push(movieId);
          await user.save();
        }
        return res.status(200).send({ success: true, message: "Added to profile watchlist" });
      }
    }

    if (!user.watchlist.includes(movieId)) {
      user.watchlist.push(movieId);
      await user.save();
    }
    res.status(200).send({ success: true, message: "Added to account watchlist" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error in watchlist" });
  }
};

const removeFromWatchlistController = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { profileId } = req.body; // or req.query depending on how we send it, usually body for DELETE is tricky, let's allow it in body or query
    
    const user = await userModel.findById(req.user._id);
    
    // Check if profileId is passed in query or body
    const pid = profileId || req.query.profileId;

    if (pid) {
      const profile = user.profiles.id(pid);
      if (profile) {
        profile.watchlist = profile.watchlist.filter(id => id.toString() !== movieId);
        await user.save();
        return res.status(200).send({ success: true, message: "Removed from profile watchlist" });
      }
    }

    user.watchlist = user.watchlist.filter(id => id.toString() !== movieId);
    await user.save();
    res.status(200).send({ success: true, message: "Removed from account watchlist" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error removing from watchlist" });
  }
};

const getWatchlistController = async (req, res) => {
  try {
    const { profileId } = req.query;
    const user = await userModel.findById(req.user._id).populate(profileId ? "profiles.watchlist" : "watchlist");
    
    if (profileId) {
      const profile = user.profiles.find(p => p._id.toString() === profileId);
      return res.status(200).send({ success: true, watchlist: profile ? profile.watchlist : [] });
    }
    
    res.status(200).send({ success: true, watchlist: user.watchlist });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching watchlist" });
  }
};

const updateHistoryController = async (req, res) => {
  try {
    const { movieId, progress, profileId } = req.body;
    const user = await userModel.findById(req.user._id);
    
    let historyTarget = user;
    if (profileId) {
      const profile = user.profiles.id(profileId);
      if (profile) historyTarget = profile;
    }

    const historyIndex = historyTarget.history.findIndex(h => h.movie.toString() === movieId);
    
    if (historyIndex > -1) {
      historyTarget.history[historyIndex].progress = progress;
      historyTarget.history[historyIndex].watchedAt = Date.now();
    } else {
      historyTarget.history.push({ movie: movieId, progress });
    }

    // Auto-remove from watchlist if it was there
    if (historyTarget.watchlist && historyTarget.watchlist.length > 0) {
      historyTarget.watchlist = historyTarget.watchlist.filter(
        (id) => id.toString() !== movieId.toString()
      );
    }

    
    await user.save();
    res.status(200).send({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false });
  }
};

const addProfileController = async (req, res) => {
  try {
    const { name, avatar, isChild } = req.body;
    const user = await userModel.findById(req.user._id);
    if (user.profiles.length >= 5) {
      return res.status(400).send({ success: false, message: "Maximum 5 profiles allowed" });
    }
    user.profiles.push({ name, avatar, isChild });
    await user.save();
    res.status(201).send({ success: true, message: "Profile added", profiles: user.profiles });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error adding profile" });
  }
};

const getProfilesController = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id).select("profiles");
    res.status(200).send({ success: true, profiles: user.profiles });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error fetching profiles" });
  }
};

const deleteProfileController = async (req, res) => {
  try {
    const { profileId } = req.params;
    const user = await userModel.findById(req.user._id);
    user.profiles = user.profiles.filter(p => p._id.toString() !== profileId);
    await user.save();
    res.status(200).send({ success: true, message: "Profile deleted" });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error deleting profile" });
  }
};

const getHistoryController = async (req, res) => {
  try {
    const { profileId } = req.query;
    const user = await userModel.findById(req.user._id).populate({
      path: profileId ? "profiles.history.movie" : "history.movie",
      select: "title slug description duration language category isPremium"
    });
    
    let history = [];
    if (profileId) {
      const profile = user.profiles.find(p => p._id.toString() === profileId);
      history = profile ? profile.history : [];
    } else {
      history = user.history;
    }
    
    // Sort by latest watched
    history.sort((a, b) => b.watchedAt - a.watchedAt);
    
    res.status(200).send({ success: true, history });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "Error fetching history" });
  }
};

const banUserController = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    user.isBanned = !user.isBanned;
    await user.save();
    res.status(200).json({
      success: true,
      message: `User ${user.isBanned ? "banned" : "unbanned"} successfully`,
      isBanned: user.isBanned,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error updating ban status" });
  }
};

const getUserDetailController = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.params.id)
      .select("-password -question")
      .populate("history.movie", "title slug poster duration")
      .populate("watchlist", "title slug poster");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Fetch their orders separately
    const orders = await orderModel
      .find({ buyer: req.params.id })
      .populate("movies", "title slug poster")
      .sort({ createdAt: -1 });

    // Fetch their rentals
    const rentalModel = require("../models/rentalModel");
    const rentals = await rentalModel
      .find({ user: req.params.id, "payment.success": true })
      .populate("movie", "title slug poster rentalPrice")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, user, orders, rentals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching user detail" });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  testController,
  getAllUsersController,
  updateSubscriptionController,
  getAllUsers,
  getSingleUser,
  getOrdersController,
  getAllOrdersController,
  orderStatusController,
  changePasswordController,
  addToWatchlistController,
  removeFromWatchlistController,
  getWatchlistController,
  updateHistoryController,
  getHistoryController,
  addProfileController,
  getProfilesController,
  deleteProfileController,
  banUserController,
  getUserDetailController,
}

// Update User Role (Module E)
module.exports.updateRoleController = async (req, res) => {
  try {
    const { userId, role } = req.body;
    
    // Prevent self-downgrade (optional but recommended)
    if (userId === req.user._id && role !== 1) {
      return res.status(400).send({ success: false, message: "Super Admins cannot downgrade themselves" });
    }

    const user = await userModel.findByIdAndUpdate(userId, { role }, { new: true });
    
    // Log Action
    const logAdminAction = require("../utils/auditLogger");
    await logAdminAction(req.user._id, "UPDATE_ROLE", "User", `Changed role for user: ${user.name} to ${role}`, { targetUserId: userId, newRole: role }, req);

    res.status(200).send({
      success: true,
      message: "Role updated successfully",
      user
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "Error updating role", error });
  }
};
