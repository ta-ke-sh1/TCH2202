import express from "express";
import { initializeApp } from "firebase/app";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsWithinRange,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../service/constants.mjs";
import { sendMail } from "../service/mail.mjs";
import { containsRole } from "../service/tokenAuth.mjs";
import { addMockIdeas } from "../utils/mockHelper.mjs";
import { React } from "../model/react.mjs";

const router = express.Router();
const collectionRef = Constants.IdeaRepository;
const reactionRef = Constants.ReactionRepository;

router.get('/react', async (req, res) => {
    const idea = req.query.idea;
    const user = req.query.user;
    const reaction = parseInt(req.query.reaction);

    await updateDocument(reactionRef, idea + "-" + user, new React(idea + "-" + user, reaction));

    res.status(200).send({ message: 'reacted' });
})

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

router.get("/approve", async (req, res) => {
    const id = req.query.post;
    var idea = Idea.fromJson(await fetchDocumentById(collectionRef, id));

    if (idea === null || idea === undefined) {
        res.status(300).send({ message: 'Idea does not exists. Id: ' + id });
    } else {
        idea.stat = 'Approved';
        await updateDocument(collectionRef, id, idea);
        res.status(200).send({ message: 'Idea approved. Id: ' + id });
    }

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
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sort = req.query.sort;
    const asc = req.query.asc;

    var ideas = [];
    const docs = await fetchAllMatchingDocumentsWithinRange(
        collectionRef,
        startDate,
        endDate,
    );

    docs.forEach((snapshot) => {
        ideas.push(Idea.fromJson(snapshot.data()));
    });

    switch (sort) {
        case 'count':
            ideas = ideas.sort((a, b) => { return a.visit_count - b.visit_count });
            break;
        case 'post_date':
            ideas = ideas.sort((a, b) => { return a.post_date - b.post_date });
            break;
        case 'expiration_date':
            ideas = ideas.sort((a, b) => { return a.expiration_date - b.expiration_date });
            break;
        default:
            break;
    }

    switch (asc) {
        case 'asc':
            ideas = ideas.reverse();
            break;
        default:
            break;
    }

    res.status(200).send({
        success: true,
        code: 200,
        ideas: ideas,
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
