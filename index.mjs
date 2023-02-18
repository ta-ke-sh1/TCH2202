import express, { json } from "express";
import cors from "cors";
import departmentController from "./controllers/departmentController.mjs";
import ideaController from "./controllers/ideaController.mjs";
import userController from "./controllers/userController.mjs";
import commentController from "./controllers/commentController.mjs";
import { authorize, containsRole } from "./service/tokenAuth.mjs";

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
    var respond = await authorize(username, password);
    res.send(respond);
});

app.get("/", cors(), containsRole('Admin'), async (req, res) => {
    res.status(200).send({ success: true, code: 200, message: req.decodedToken })
});

const PORT = process.env.PORT || 5000;
app.listen(PORT);
console.log("Server is running! " + PORT);

export default app;
