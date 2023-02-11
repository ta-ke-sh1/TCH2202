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

router.get("/idea", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var idea = Idea.fromJson(snapshot.data(), snapshot.id);
    res.send(idea);
});

router.post("/add", async (req, res) => {
    var idea = new Idea(
        null,
        req.body.writer_id,
        req.body.approver_id,
        req.body.file,
        req.body.post_date,
        req.body.expiration_date,
        req.body.visit_count,
        req.body.stat,
        req.body.is_anonymous
    );
    await addDocument(collection, idea);
    console.log("Idea added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var idea = new Idea(
        req.body.id,
        req.body.writer_id,
        req.body.approver_id,
        req.body.file,
        req.body.post_date,
        req.body.expiration_date,
        req.body.visit_count,
        req.body.stat,
        req.body.is_anonymous
    );
    await updateDocument(collection, req.body.id, idea);
    console.log("Idea updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("Idea deleted, ID: " + req.body.id);
});

export default router;
