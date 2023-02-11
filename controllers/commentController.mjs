import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../repository/firebaseHelper.mjs";
import { Comment } from "../model/comment.mjs";
import * as Constants from "../repository/constants.mjs";

const router = express.Router();
const collection = Constants.CommentRepository;

router.get("/", async (req, res) => {
    const Comments = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("Comment Page");
    snapshots.forEach((snapshot) => {
        Comments.push(Comment.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(Comments);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = new Comment();
});

router.post("/add", async (req, res) => {
    var Comment = new Comment(null, req.body.name, 0);
    console.log(Comment);
    await addDocument(collection, Comment);
    console.log("New Comment Added");
    console.log("Comment added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var Comment = new Comment(req.body.id, req.body.name, req.body.emp_count);
    await updateDocument(collection, Comment.id, Comment);
    console.log("Comment updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("Comment deleted, ID: " + req.body.id);
});

export default router;
