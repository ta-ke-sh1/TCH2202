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
    const Users = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("User Page");
    snapshots.forEach((snapshot) => {
        Users.push(User.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(Users);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = new User();
});

router.post("/add", async (req, res) => {
    var User = new User(null, req.body.name, 0);
    console.log(User);
    await addDocument(collection, User);
    console.log("New User Added");
    console.log("User added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var User = new User(req.body.id, req.body.name, req.body.emp_count);
    await updateDocument(collection, User.id, User);
    console.log("User updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("User deleted, ID: " + req.body.id);
});

export default router;
