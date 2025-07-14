const User = require('../models/users')
const registeruser = async (req , res)=>{
    const{username , email , password}= req.body
    try{
        const newUser = await User.create({username , email , password})
        // Send welcome email
        sendMail(email, 'Welcome to Phish Defense', `<h2>Welcome ${username} to Phish Defense!</h2><p>We are excited to have you on board.</p>`)
          .then(() => console.log(`Welcome email sent to ${email}`))
          .catch((err) => console.error(`Failed to send welcome email to ${email}:`, err));
        res.status(201).json(newUser)
    }
    catch(err){
        res.status(400).json({message:err.message})
    }
}
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('username email');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const bcrypt = require('bcryptjs');
const sendMail = require('../utils/mail');

const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });
        user.password = await bcrypt.hash(newPassword, 12);
        await user.save();
        // Send password change email
        await sendMail(user.email, 'Phish Defense Password Changed', `<h2>Hello ${user.username},</h2><p>Your password was successfully changed. If this wasn't you, please contact support immediately.</p>`);
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        // Only allow user to delete their own account
        if (!req.user || req.user._id !== req.params.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {registeruser, getUserById, changePassword, deleteUser};