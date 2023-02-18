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
import { uniqueNamesGenerator, names } from "unique-names-generator";
import { writeBatch, doc, getFirestore } from "firebase/firestore";

const router = express.Router();
const collectionRef = Constants.UserRepository;

const app = initializeApp(Constants.firebaseConfig);
const db = getFirestore(app);

router.get("/", async (req, res) => {
    const users = [];
    var snapshots = await fetchAllDocuments(collectionRef);
    console.log("User Page");
    snapshots.forEach((snapshot) => {
        users.push(User.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(users);
});

router.get("/get/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collectionRef, id);
    var dept = User.fromJson(snapshot.data(), snapshot.id);
    res.send(dept);
});

router.post("/add", async (req, res) => {
    var user = new User(
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
    await register(collectionRef, user);
    console.log("User added, ID: " + req.body.id);
});

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

router.get("/clearDatabase", async (req, res) => {
    var users = await fetchAllDocuments(collectionRef);
    users = users.filter((x) => {
        return x.id !== "admin";
    });

    var batch = writeBatch(db);
    users.forEach((user) => {
        const docRef = doc(db, collectionRef, user.id);
        batch.delete(docRef);
    });
    await batch.commit();
    res.status(200).send({ success: true, message: "Deleted all mock users" });
});

router.get("/addMock", async (req, res) => {
    const roles = {
        1: "1D17R3ozi5G8Ih12H4CV",
        2: "HrBpfqyOOPVomC6FuyPM",
        3: "TnKVhc7Euaskx4W9n3sW",
        4: "ZbxTmrJKbT16HOSYPbN2",
        5: "s4sXB2J5q6Zx1f4qIIwB",
    };

    const users = [];
    for (let i = 0; i < 20; i++) {
        var name =
            uniqueNamesGenerator({
                dictionaries: [names],
            }) +
            uniqueNamesGenerator({
                dictionaries: [names],
            });
        var user = new User(
            roles[getRndInteger(1, 5)],
            name.toLowerCase(),
            "123456",
            name,
            getRndInteger(1990, 2004) +
                "/" +
                getRndInteger(1, 12) +
                "/" +
                getRndInteger(1, 30),
            ["Staff"],
            "+840" + getRndInteger(30, 99) + getRndInteger(100000, 999999),
            "Activated",
            "/avatar/" + name.replace(" ", "").toLowerCase(),
            name.replace(" ", "") + "@gmail.com"
        );
        users.push(user);
    }

    var batch = writeBatch(db);

    users.forEach((user) => {
        const docRef = doc(db, collectionRef, user.username);
        console.log(user.toJson());
        batch.set(docRef, user.toJson());
    });

    await batch.commit();
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
