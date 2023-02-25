import express, { json } from "express";
import cors from "cors";
import departmentController from "./controllers/departmentController.mjs";
import ideaController from "./controllers/ideaController.mjs";
import userController from "./controllers/userController.mjs";
import commentController from "./controllers/commentController.mjs";
import { authorize, containsRole } from "./service/tokenAuth.mjs";
import { isExists } from "./service/tokenAuth.mjs";
import jwt from "jsonwebtoken";
import * as path from "path";
import * as fs from "fs";
import { zip } from "zip-a-folder";

const app = express();

app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(json());

app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST"],
    })
);

app.use("/department", departmentController);

app.use("/idea", ideaController);

app.use("/user", userController);

app.use("/comment", commentController);

app.post("/login", async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    if (username === undefined || password === undefined) {
        res.status(300).send({
            message: "Invalid password/username!",
        });
    } else {
        var respond = await authorize(username, password);
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

app.get("/test", cors(), async (req, res) => {
    console.log(req.get("Refresh"));
    res.status(200).json(req.cookies);
});

app.get("/zipDirectory", cors(), async (req, res) => {
    var _out =
        path.resolve() +
        "\\summary_file\\summary" +
        new Date().toJSON().slice(0, 10).replace(/-/g, "-") +
        ".zip";
    var _in = path.resolve() + "\\assets\\files\\";
    await zip(_in, _out);
    res.status(200).download(_out);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running! " + PORT);

export default app;
