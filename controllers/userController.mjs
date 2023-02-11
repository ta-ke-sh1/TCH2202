import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../repository/firebaseHelper.mjs";
import { User } from "../model/user.mjs";
import * as Constants from "../repository/constants.mjs";

const router = express.Router();
const collection = Constants.UserRepository;

router.get("/", async (req, res) => {
    const users = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("User Page");
    snapshots.forEach((snapshot) => {
        users.push(User.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(users);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = User.fromJson(snapshot.data(), snapshot.id);
    res.send(dept);
});

router.post("/add", async (req, res) => {
    var user = new User(
        null,
        req.body.department_id,
        req.body.username,
        req.body.password,
        req.body.fullName,
        req.body.dob,
        req.body.role,
        req.body.phone,
        req.body.stat
    );
    await addDocument(collection, user);
    console.log("User added, ID: " + req.body.id);
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
        req.body.stat
    );
    await updateDocument(collection, user.id, user);
    console.log("User updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("User deleted, ID: " + req.body.id);
});

export default router;
