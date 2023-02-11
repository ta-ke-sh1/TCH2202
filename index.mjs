import functions from "firebase-functions";
import express, { json } from "express";
import cors from "cors";
import departmentController from "./controllers/departmentController.mjs";
import ideaController from "./controllers/ideaController.mjs";
import userController from "./controllers/userController.mjs";
import authController from "./controllers/authController.mjs";

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

app.use("/auth", authController);

app.get("/", cors(), async (req, res) => {
    console.log("Hello world");
    res.send(req.headers);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running! " + PORT);

export default app;
