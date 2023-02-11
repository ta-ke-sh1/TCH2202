import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../repository/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../repository/constants.mjs";

const router = express.Router();
const collection = Constants.IdeaRepository;

router.get("/", async (req, res) => {
    const Ideas = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("Idea Page");
    snapshots.forEach((snapshot) => {
        Ideas.push(Idea.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(Ideas);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = new Idea();
});

router.post("/add", async (req, res) => {
    var Idea = new Idea(null, req.body.name, 0);
    console.log(Idea);
    await addDocument(collection, Idea);
    console.log("New Idea Added");
    console.log("Idea added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var Idea = new Idea(req.body.id, req.body.name, req.body.emp_count);
    await updateDocument(collection, Idea.id, Idea);
    console.log("Idea updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("Idea deleted, ID: " + req.body.id);
});

export default router;
