const User = require("../model/userModel");
const bcrypt = require('bcrypt');

module.exports.register = async(req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ msg: "Username already in use", status: false });
        }
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ msg: "Email is already in use", status: false });
        }
        const hasedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hasedPassword
        });
        delete user.password;
        return res.json({ status: true, user });
    } catch (err) {
        next(err);
    }
};

module.exports.login = async(req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.json({ msg: "Username or password incorrect", status: false });
        }
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.json({
                msg: "Username or password incorrect",
                status: false,
            });
        }
        delete user.password;
        return res.json({ status: true, user });
    } catch (err) {
        next(err);
    }
};

module.exports.getAllUsers = async(req, res, next) => {
    try {
        const userId = req.params.id;
        const users = await User.find({ _id: { $ne: userId } }).select([
            "username",
            "email",
            "avatar",
            "_id"
        ])
        return res.json(users);
    } catch (err) {
        next(err);
    }
}


module.exports.setAvatar = async(req, res, next) => {
    try {
        const userId = req.params.id;
        const avatar = req.body.image;
        const userData = await User.findByIdAndUpdate(
            userId, {
                isAvatarImageSet: true,
                avatar,
            }, { new: true }
        );
        return res.json({
            isSet: userData.isAvatarImageSet,
            image: userData.avatar,
        });
    } catch (ex) {
        next(ex);
    }
}