import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    deleteDocument,
    updateDocument,
    fetchUserById,
    fetchAllUsers,
} from "../service/firebaseHelper.mjs";
import { register } from "../service/tokenAuth.mjs";
import { User } from "../model/user.mjs";
import * as Constants from "../utils/constants.mjs";
import bcrypt from "bcryptjs";
import { addMockUsers, clearDocument } from "../utils/mockHelper.mjs";

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
            users.push(User.fromJson(snapshot.data(), snapshot.id));
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

    var result = await register(user);

    res.status(result.code).json({
        message: result.message,
    });
});

router.put("/", upload.single("avatar"), async (req, res) => {
    var user = await fetchUserById(collectionRef, req.body.id);

    if (!user) {
        res.status(300).send({
            message: "User doesn't exists!",
        });
    } else {
        var updateObj = {
            department_id: req.body.department_id,
            fullName: req.body.fullName,
            dob: req.body.dob,
            role: req.body.role,
            stat: req.body.stat,
            email: req.body.email,
        };

        if (req.file) {
            const filename = user.id + path.extname(req.file.originalname);
            console.log(filename);
            updateObj.avatar = ref(storage, "/avatar/" + filename);
        }

        const respond = await setUser(collectionRef, req.body.id, updateObj);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

router.delete("/", async (req, res) => {
    const respond = await deleteDocument(collectionRef, req.body.id);
    console.log("User deleted, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
});

export default router;
