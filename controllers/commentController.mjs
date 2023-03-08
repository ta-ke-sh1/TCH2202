import express from "express";
import {
    fetchAllMatchingDocuments,
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Comment } from "../model/comment.mjs";
import * as Constants from "../utils/constants.mjs";

const router = express.Router();
const collectionRef = Constants.CommentRepository;

router.get("/", async (req, res) => {
    const id = req.query.id;
    const comments = [];
    var snapshots = await fetchAllMatchingDocuments(collectionRef, 'idea_id', id);
    snapshots.forEach((snapshot) => {
        comments.push({ data: Comment.fromJson(snapshot.data()), id: snapshot.id });
    });
    res.send(comments);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collectionRef, id);
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
    await addDocument(collectionRef, comment);
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
    const respond = await updateDocument(collectionRef, comment.id, comment);
    console.log("Comment updated, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
});

router.get("/delete", async (req, res) => {
    const respond = await deleteDocument(collectionRef, req.body.id);
    console.log("Comment deleted, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
});

export default router;
