
function routes(app, controller) {


    app.post("/login", async (req, res, next) => {
        const { name, password } = req.body;
        try {
            const result = await controller.loginAction({ name, password });
            res.json({ success: true, result });
        } catch (e) {
            next(e);
        }
    });

    app.post("/logout", controller.isLoggedIn, async (req, res, next) => {
        const userId = req.userId;
        try {
            const result = await controller.logoutAction(userId);
            res.json({ success: true, result });
        } catch (e) {
            next(e);
        }
    });

    app.get("/getUserData", controller.isLoggedIn, async (req, res, next) => {
        try {
            res.json({ success: true, result: req.user });
        } catch (e) {
            next(e);
        }
    });

}

module.exports = routes;