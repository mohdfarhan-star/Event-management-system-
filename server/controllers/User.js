const User = require('../models/User');

// Create a new user profile
exports.createUser = async (req, res) => {
    try {
        const { name, timezone = 'UTC' } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }

        const user = await User.create({
            name: name.trim(),
            timezone,
        });

        return res.status(201).json({
            success: true,
            message: "User profile created successfully",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create user profile"
        });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            data: users
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
};

// Update user timezone
exports.updateUserTimezone = async (req, res) => {
    try {
        const { userId, timezone } = req.body;

        if (!userId || !timezone) {
            return res.status(400).json({
                success: false,
                message: "User ID and timezone are required",
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { timezone },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User timezone updated successfully",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update user timezone"
        });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch user"
        });
    }
};
