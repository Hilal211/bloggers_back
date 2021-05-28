const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function controller(db) {

    async function isLoggedIn(req, res, next) {

        const id = req.header("id");
        const token = req.header("token");

        if (!token) next(new Error("Auth Error"));

        try {

            const decoded = jwt.verify(token, "randomString");
            if (id != decoded.userId) next(new Error("Invalid Token"));

            const statement = `SELECT id, email, password, token FROM admin WHERE token = "${token}"`;
            const user = await db.get(statement);
            if (!user || !user.id || user.id != id) next(new Error("Invalid Token"));

            req.userId = decoded.userId;
            req.user = user;

            next();

        } catch (e) {
            next(new Error("Invalid Token"));
        }

    }


    async function loginAction({ name, password }) {
        // check body data
        if (!name || !password) throw new Error("Email and password are required");
        try {
            // get user
            let statement = `SELECT id, email, password FROM admin WHERE email = "${name}"`;
            let user = await db.get(statement);
            if (!user) throw new Error("User not found");

            // check the password
            // let isMatch = await bcrypt.compare(password, user.password);
            // if (!isMatch) throw new Error("Incorrect Password !");
            if (password != user.password) throw new Error("Incorrect Password !");

            // generate token
            let payload = { userId: user.id };
            let token = jwt.sign(payload, "randomString", { expiresIn: 30 * 24 * 60 * 60 * 1000 });

            // add token to the user
            await db.run('UPDATE admin SET token = ? WHERE id = ?', token, user.id);

            return { ...user, token };
        } catch (e) {
            throw new Error(`couldn't login user ` + e.message);
        }
    }

    async function logoutAction(userId) {
        try {
            // remove token for user record
            await db.run('UPDATE admin SET token = ? WHERE id = ?', null, userId);
            return { message: "logged out successfully" }
        } catch (e) {
            throw new Error(`couldn't logout user ` + e.message);
        }
    }

    return { isLoggedIn, loginAction, logoutAction }

}

module.exports = controller;