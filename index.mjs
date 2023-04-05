import express, { json } from "express";
import cors from "cors";
import departmentController from "./controllers/departmentController.mjs";
import ideaController from "./controllers/ideaController.mjs";
import userController from "./controllers/userController.mjs";
import adminController from "./controllers/adminController.mjs";
import commentController from "./controllers/commentController.mjs";
import categoryController from "./controllers/categoryController.mjs";
import reactionController from "./controllers/reactionController.mjs";
import testController from "./controllers/testController.mjs";
import eventController from "./controllers/eventController.mjs";
import hashtagController from "./controllers/hashtagController.mjs";
import { authorize, containsRole } from "./service/tokenAuth.mjs";
import { isExists } from "./service/tokenAuth.mjs";
import jwt from "jsonwebtoken";
import { updateLoginMetrics } from "./service/metrics.mjs";

const app = express();

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(express.static("assets"));

app.use(json());

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "UPDATE", "DELETE", "PUT"],
    })
);

app.use("/department", departmentController);

app.use("/idea", ideaController);

app.use("/user", userController);

app.use("/comment", commentController);

app.use("/admin", adminController);

app.use("/category", categoryController);

app.use("/reaction", reactionController);

app.use("/test", testController);

app.use("/thread", eventController);

app.use("/hashtag", hashtagController);

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const device_type = req.body.device_type;
    if (username === undefined || password === undefined) {
        res.status(300).send({
            message: "Invalid password/username!",
        });
    } else {
        var respond = await authorize(username, password);
        updateLoginMetrics(device_type);
        res.status(respond.code).json(respond);
    }
});

app.post("/refresh", async (req, res) => {
    const refreshToken = req.body.refreshToken;
    jwt.verify(
        refreshToken.substring(7, refreshToken.length),
        process.env.JWT_SECRET_REFRESH,
        async (err, decoded) => {
            if (err) {
                return res.status(406).json({ message: "Invalid Token" });
            } else {
                var user = await isExists(decoded.user);
                const accessToken =
                    "Bearer " +
                    jwt.sign(
                        {
                            user: user.id,
                            email: user.email,
                            role: user.data().role,
                        },
                        process.env.JWT_SECRET_ACCESS,
                        {
                            expiresIn: "10m",
                        }
                    );
                return res.json({ accessToken });
            }
        }
    );
});

app.get("/", cors(), containsRole("Admin"), async (req, res) => {
    res.status(200).send({
        success: true,
        code: 200,
        message: req.decodedToken,
    });
});

const PORT = process.env.PORT || 9000;
app.listen(PORT);
console.log("Server is running! " + PORT);

export default app;
