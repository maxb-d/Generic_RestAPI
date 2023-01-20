const User = require('../models/User')
const Note = require('../models/Note')

// Keeping us from using try catch blocks
const asyncHandler = require('express-async-handler')

// Hashing password
const bcrypt = require('bcrypt')

/**
 * @desc Get all users
 * @route GET /users
 * @access Private
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) {
        return res.status(400).json({ message: "No users found"})
    }
    res.json(users)
})

/**
 * @desc Create new user
 * @route POST /users
 * @access Private
 */
const createNewUser = asyncHandler(async (req, res) => {
    const { username, password, roles } = req.body

    // Confirm data
    if(!username || !password || !Array.isArray(roles) || !roles.length) {
        // 400 = bad request
        return res.status(400).json({ message: "All fields are required" })
    }

    // Check for duplcate
    const duplicate = await User.findOne({ username }).lean().exec()

    if(duplicate) {
        // 409 = conflict
        return res.status(409).json({ message: "Duplicate username" })
    }

    const hashedPassword = await bcrypt.hash(password, 10) // 10 salt rounds

    const userObject = { username, "password": hashedPassword, roles }

    // Create and store new user
    const user = await User.create(userObject)

    if(user) {
        res.status(201).json({ message: `New user ${username} created.` })
    } else {
        res.status(400).json({ message: "Invalid user data received" })
    }
})

/**
 * @desc Update user
 * @route PATCH /users
 * @access Private
 */
const updateUser = asyncHandler(async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: "All fields are required" })
    }

    /**
     * We dont use lean() here because we need the document and not the json returned
     * by lean to be able to save the updated user
     */
    const user = await User.findById(id).exec()
    if(!user) {
        return res.status(400).json({ message: "User not found" })
    }

    // Check for duplicate
    const duplicate = await User.findOne({ username }).lean().exec()

    // Allow updates to the original user
    /**
     * Optionnal chaining : duplicate?._id
     * if the object accessed or function called is undefined or null
     * it returns undefined instead of throwing an error
     */
    if(duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: "Duplicate username"})
    }

    // Update the user
    user.username = username
    user.roles = roles
    user.active = active

    /** 
     * We didn't update the password cause we dont want to require
     * someone to always sending the password update
     */
    if(password) {
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()

    res.json({ message: `${updatedUser.username} updated` })
})

/**
 * @desc Delete user
 * @route DELETE /users
 * @access Private
 */
const deleteUser = asyncHandler(async (req, res) => {
    const { id } = req.body

    if(!id) {
        return res.status(400).json({ message: "User ID required" })
    }

    /**
     * We dont want to delete a user that still has assigned notes
     */
    const note = await Note.findOne({ user: id }).lean().exec()
    if(note) {
        return res.status(400).json({ message: "User has assigned notes" })
    }

    const user = await User.findById(id).exec()

    if(!user) {
        return res.status(400).json({ message: "User not found" })
    }

    /**
     * Deletes the user but the result holds the informations from the deleted user
     */
    const result = await user.deleteOne()

    const reply = `Username ${result.username} with ID ${result.id} deleted`

    res.json(reply)
})

module.exports = { 
    getAllUsers, 
    createNewUser, 
    updateUser, 
    deleteUser 
}
