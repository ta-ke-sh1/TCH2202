import express from "express";
import {
    fetchAllMatchingDocuments,
    addDocument,
    deleteDocument,
    updateDocument,
    fetchUserById,
    fetchDocumentById,
} from "../service/firebaseHelper.mjs";
import { Comment } from "../model/comment.mjs";
import * as Constants from "../utils/constants.mjs";
import { updateDocumentMetrics } from "../service/metrics.mjs";
import { sendMail } from "../service/mail.mjs";

const router = express.Router();
const collectionRef = Constants.CommentRepository;

router.get("/", async (req, res) => {
    const id = req.query.id;
    const comments = [];
    var snapshots = await fetchAllMatchingDocuments(
        collectionRef,
        "idea_id",
        id
    );
    snapshots.forEach((snapshot) => {
        comments.push({
            data: Comment.fromJson(snapshot.data()),
            id: snapshot.id,
        });
    });
    res.send(comments);
});

router.post("/", async (req, res) => {
    console.log(req.body.user_id);
    var comment = new Comment(
        req.body.idea_id,
        req.body.user_id,
        req.body.content,
        req.body.date,
        req.body.isAnonymous
    );
    const response = await addDocument(collectionRef, comment);

    updateDocumentMetrics("Comment");

    var idea = await fetchDocumentById(
        Constants.IdeaRepository,
        req.body.idea_id
    );
    var u = await fetchUserById(idea.data().writer_id);
    if (u) {
        console.log(u.data());
        sendMail(
            u.data().email,
            "New comment to your post",
            req.body.user_id + " has commented: " + req.body.content
        );
    }
    res.status(200).json(response);
});

router.put("/", async (req, res) => {
    if (!req.body.id) {
        res.status(300).send({
            message: "No id was provided",
        });
    } else {
        var comment = new Comment(
            req.body.id,
            req.body.user_id,
            req.body.content,
            req.body.date,
            req.body.isAnonymous,
        );
        const respond = await updateDocument(
            collectionRef,
            comment.id,
            comment.toJson()
        );
        console.log("Comment updated, ID: " + req.body.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

router.delete("/", async (req, res) => {
    if (!req.query.id) {
        res.status(300).send({
            message: "No id was provided",
        });
    } else {
        const respond = await deleteDocument(collectionRef, req.query.id);
        console.log("Comment deleted, ID: " + req.query.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

export default router;
