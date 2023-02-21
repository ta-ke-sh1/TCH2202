import express from "express";
import { initializeApp } from "firebase/app";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsMultipleCriteria,
} from "../service/firebaseHelper.mjs";
import { getFirestore } from "firebase/firestore";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../service/constants.mjs";
import { sendMail } from "../service/mail.mjs";
import { containsRole } from "../service/tokenAuth.mjs";
import { addMockIdeas } from "../utils/mockHelper.mjs";

const router = express.Router();
const collectionRef = Constants.IdeaRepository;

const app = initializeApp(Constants.firebaseConfig);
const db = getFirestore(app);

router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshot = await fetchDocumentById(collectionRef, id);
        if (snapshot) {
            var idea = Idea.fromJson(snapshot.data(), snapshot.id);
            res.status(200).send(idea);
        }
        res.status(400).send({
            success: false,
            code: 400,
            message: "Document does not exist!",
        });
    } else {
        const Ideas = [];
        var snapshots = await fetchAllDocuments(collectionRef);
        console.log("Idea Page");
        snapshots.forEach((snapshot) => {
            Ideas.push(Idea.fromJson(snapshot.data(), snapshot.id));
        });
        res.status(200).send(Ideas);
    }
});

router.post("/approve", async (req, res) => {
    const id = req.body.post_id;
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

router.get("/addMock", async (req, res) => {
    addMockIdeas();
    res.status(200).send({
        success: true,
        code: 200,
        message: "40 new ideas added",
    });
});

router.get("/sort", async (req, res) => {
    const startDate = req.query.fromDate;
    const endDate = req.query.toDate;
    const sortBy = req.query.sort;
    const ascending = req.query.asc;

    const ideas = [];
    const docs = await fetchAllMatchingDocumentsMultipleCriteria(
        collectionRef,
        startDate,
        endDate,
        sortBy,
        ascending
    );

    docs.forEach((snapshot) => {
        ideas.push(Idea.fromJson(snapshot.data(), snapshot.id));
        console.log(snapshot.data()["category"]);
    });

    res.status(200).send({
        success: true,
        code: 200,
        message: startDate + " " + endDate + " " + sortBy + " " + ascending,
    });
});

router.get("/category", async (req, res) => {
    const categoryId = req.query.id;

    const ideas = [];
    const docs = await fetchAllMatchingDocuments(
        collectionRef,
        "category",
        categoryId
    );

    docs.forEach((snapshot) => {
        ideas.push(Idea.fromJson(snapshot.data(), snapshot.id));
        console.log(snapshot.data()["category"]);
    });

    res.status(200).send({
        success: true,
        code: 200,
        message: ideas,
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
    await addDocument(collectionRef, idea);

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
    await updateDocument(collectionRef, req.body.id, idea);
    console.log("Idea updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collectionRef, req.body.id);
    console.log("Idea deleted, ID: " + req.body.id);
});

export default router;
