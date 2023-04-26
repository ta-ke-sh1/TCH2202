import express from "express";
import {
    updateUser,
    fetchUserById,
    fetchAllUsers,
} from "../service/firebaseHelper.mjs";
import { register } from "../service/tokenAuth.mjs";
import { User } from "../model/user.mjs";
import * as Constants from "../utils/constants.mjs";
import bcrypt from "bcryptjs";

const router = express.Router();
const collectionRef = Constants.UserRepository;

import * as path from "path";
import multer from "multer";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = path.resolve() + "/assets/avatar/" + req.body.username;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, req.body.username + "_" + file.originalname);
    },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshot = await fetchUserById(id);
        if (snapshot) {
            var user = User.fromJson(snapshot.data(), snapshot.id);
            console.log(user);
            res.status(200).send(user);
        } else {
            res.status(400).send({
                success: false,
                code: 400,
                message: "Document does not exist!",
            });
        }
    } else {
        const users = [];
        var snapshots = await fetchAllUsers(collectionRef);
        console.log("User Page");
        snapshots.forEach((snapshot) => {
            users.push(User.fromJson(snapshot, snapshot.id));
        });
        console.log(users.length);
        res.send(users);
    }
});

router.post("/", upload.single("avatar"), async (req, res) => {
    var avatarPath = "";
    if (req.file) {
        avatarPath = req.file.path;
    } else {
        avatarPath = "/avatar/default.jpg";
    }

    var user = new User(
        req.body.department_id,
        req.body.username,
        bcrypt.hashSync(req.body.password, 10),
        req.body.fullName,
        req.body.dob,
        req.body.role,
        req.body.phone,
        req.body.stat,
        avatarPath,
        req.body.email
    );

    console.log(user);
    var result = await register(user);

    res.status(result.code).json({
        message: result.message,
    });
});

router.post("/edit", upload.single("avatar"), async (req, res) => {
    console.log(req.body);
    if (!req.body.id) {
        res.status(300).json({
            message: "No id was provided!",
        });
    } else {
        var user = await fetchUserById( req.body.id);
        console.log('User: ')
        if (!user) {
            res.status(300).send({
                message: "User doesn't exists!",
            });
        } else {
            var updateObj = {
                department_id: !req.body.department_id ? user.data().department_id : req.body.department_id,
                fullName: !req.body.fullName ? user.data().fullName : req.body.fullName,
                role: !req.body.role ? [user.data().role] : [req.body.role],
                stat: !req.body.stat ? user.data().stat : req.body.stat,
                email: !req.body.email ? user.data().email : req.body.email,
            };

            if (req.file) {
                const filename = user.id + path.extname(req.file.originalname);
                console.log(filename);
                updateObj.avatar = ref(storage, "/avatar/" + filename);
            }

            const respond = await updateUser(
                req.body.id,
                updateObj
            );
            res.status(respond.code).send({
                message: respond.message,
            });
       }
    }
});

router.delete("/", async (req, res) => {
    if (req.body.id) {
        const respond = await updateUser(req.body.id, {
            stat: "Deactivated",
        });
        console.log("User deactivated, ID: " + req.body.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    } else {
        res.status(300).json({
            message: "No id was provided!",
        });
    }
});

export default router;
