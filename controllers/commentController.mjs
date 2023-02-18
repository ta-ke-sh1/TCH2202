import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Comment } from "../model/comment.mjs";
import * as Constants from "../service/constants.mjs";

const router = express.Router();
const collection = Constants.CommentRepository;

router.get("/", async (req, res) => {
    const comments = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("Comment Page");
    snapshots.forEach((snapshot) => {
        comments.push(Comment.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(comments);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = Comment.fromJson(snapshot.data(), snapshot.id);
    res.send(dept);
});

router.post("/add", async (req, res) => {
    var comment = new Comment(
        null,
        req.body.idea_id,
        req.body.user_id,
        req.body.content,
        req.body.date,
        req.body.isAnonymous,
        req.body.react
    );
    console.log(comment);
    await addDocument(collection, comment);
    console.log("Comment added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var comment = new Comment(
        req.body.id,
        req.body.idea_id,
        req.body.user_id,
        req.body.content,
        req.body.date,
        req.body.isAnonymous,
        req.body.react
    );
    await updateDocument(collection, comment.id, comment);
    console.log("Comment updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("Comment deleted, ID: " + req.body.id);
});

export default router;
