import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../service/constants.mjs";
import { sendMail } from "../service/mail.mjs";
import { containsRole } from "../service/tokenAuth.mjs";

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

router.post("/approve", async (req, res) => {
    const id = req.body.post_id;
});

router.get("/idea", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var idea = Idea.fromJson(snapshot.data(), snapshot.id);
    res.send(idea);
});

router.post("/test", containsRole("Admin"), async (req, res) => {
    const receiver = req.body.email;
    var today = new Date();
    var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate() +
        " : " +
        today.getHours() +
        ":" +
        today.getMinutes() +
        ":" +
        today.getSeconds();
    sendMail(receiver, "New post added", "Timeframe: " + date);
    res.status(200).send({
        success: true,
        message: "Email sent to " + receiver,
    });
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

    const receiver = req.body.approver_id;
    var today = new Date();
    var date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate() +
        " : " +
        today.getHours() +
        ":" +
        today.getMinutes() +
        ":" +
        today.getSeconds();
    sendMail(
        receiver,
        "New post added",
        "Sender: " +
            req.body.writer_id +
            ", this message was generated at: " +
            date
    );
    res.status(200).send({
        success: true,
        message: "Email sent to " + receiver,
    });

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
