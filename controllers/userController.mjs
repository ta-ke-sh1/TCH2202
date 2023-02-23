import express from "express";
import { initializeApp } from "firebase/app";
import {
    fetchAllDocuments,
    fetchDocumentById,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { register } from "../service/tokenAuth.mjs";
import { User } from "../model/user.mjs";
import * as Constants from "../service/constants.mjs";
import bcrypt from 'bcryptjs';

import { getFirestore } from "firebase/firestore";
import { addMockUsers, clearDocument } from "../utils/mockHelper.mjs";

const router = express.Router();
const collectionRef = Constants.UserRepository;

const app = initializeApp(Constants.firebaseConfig);
const db = getFirestore(app);

router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshot = await fetchDocumentById(collectionRef, id);
        if (snapshot) {
            var dept = User.fromJson(snapshot.data(), snapshot.id);
            res.status(200).send(dept);
        }
        res.status(400).send({
            success: false,
            code: 400,
            message: "Document does not exist!",
        });
    } else {
        const users = [];
        var snapshots = await fetchAllDocuments(collectionRef);
        console.log("User Page");
        snapshots.forEach((snapshot) => {
            users.push(User.fromJson(snapshot.data(), snapshot.id));
        });
        res.send(users);
    }
});

router.post("/add", async (req, res) => {
    var user = new User(
        req.body.department_id,
        req.body.username,
        bcrypt.hashSync(req.body.password, 10),
        req.body.fullName,
        req.body.dob,
        req.body.role,
        req.body.phone,
        req.body.stat,
        req.body.avatar,
        req.body.email
    );
    var result = await register(user);
    res.status(result.code).json({ message: "User added, ID: " + result.message })
});

router.get("/clearDatabase", async (req, res) => {
    clearDocument(collectionRef);
    res.status(200).send({ success: true, message: "Deleted all mock users" });
});

router.get("/addMock", async (req, res) => {
    addMockUsers();
    res.status(200).send({
        success: true,
        code: 200,
        message: "20 new users added",
    });
});

router.post("/edit", async (req, res) => {
    var user = new User(
        req.body.id,
        req.body.department_id,
        req.body.username,
        req.body.password,
        req.body.fullName,
        req.body.dob,
        req.body.role,
        req.body.phone,
        req.body.stat,
        req.body.email
    );
    await updateDocument(collectionRef, user.id, user);
    console.log("User updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collectionRef, req.body.id);
    console.log("User deleted, ID: " + req.body.id);
});

export default router;
