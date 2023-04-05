import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
    fetchAllMatchingDocuments,
    fetchAllContainingDocuments,
    fetchAllMatchingDocumentsWithinRange,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../utils/constants.mjs";
import { sendMail } from "../service/mail.mjs";

import * as path from "path";

import multer from "multer";
import fs from "fs";
import { updateDocumentMetrics } from "../service/metrics.mjs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        var dir = path.resolve() + "/assets/files/" + req.body.writer_id;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        cb(null, req.body.writer_id + "_" + file.originalname);
    },
});

const upload = multer({ storage: storage });

const router = express.Router();
const collectionRef = Constants.IdeaRepository;

router.get("/threads", async (req, res) => {
    var result = [];
    const id = req.query.id;
    if (id) {
        var snapshots = await fetchDocumentById("thread", id);
        if (snapshots) {
            res.status(200).send(snapshots.data());
        } else {
            res.status(400).send({
                success: false,
                code: 400,
                message: "Document does not exist!",
            });
        }
    } else {
        var threads = await fetchAllDocuments("thread");
        for (let i = 0; i < threads.length; i++) {
            result.push({
                id: threads[i].id,
                name: threads[i].data().name,
                startDate: threads[i].data().startDate,
                endDate: threads[i].data().endDate,
                description: threads[i].data().description,
                ideaCount: threads[i].data().ideaCount,
            });
        }
        res.status(200).json(result);
    }
});

router.get("/filter", async (req, res) => {
    const category = req.query.category;
    if (category) {
        var ideas = [];
        var snapshots = await fetchAllContainingDocuments(
            collectionRef,
            "category",
            category
        );
        snapshots.forEach((snapshot) => {
            ideas.push({
                idea: Idea.fromJson(snapshot.data()),
                id: snapshot.id,
            });
        });
        res.status(200).send(ideas);
    } else {
        res.status(300).json({ message: "Need a category indicator!" });
    }
});

router.get("/fetch", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshot = await fetchDocumentById(collectionRef, id);
        if (snapshot) {
            res.status(200).json(snapshot.data());
        } else {
            res.status(400).send({ message: "Document does not exists!" });
        }
    } else {
        res.status(400).send({ message: "Document does not exists!" });
    }
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshots = await fetchAllMatchingDocuments(
            collectionRef,
            "thread",
            id
        );
        if (snapshots) {
            const ideas = [];
            snapshots.forEach((snapshot) => {
                ideas.push({
                    idea: Idea.fromJson(snapshot.data()),
                    id: snapshot.id,
                });
            });
            res.status(200).send(ideas);
        } else {
            res.status(400).send({
                success: false,
                code: 400,
                message: "Document does not exist!",
            });
        }
    } else {
        const ideas = [];
        var snapshots = await fetchAllDocuments(collectionRef);
        snapshots.forEach((snapshot) => {
            ideas.push(Idea.fromJson(snapshot.data()));
        });
        res.status(200).send(ideas);
    }
});

router.get("/sort", async (req, res) => {
    const thread = req.query.thread;
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;
    const sort = req.query.sort;
    const asc = req.query.asc;

    var ideas = [];
    const docs = await fetchAllMatchingDocumentsWithinRange(
        collectionRef,
        thread,
        startDate,
        endDate
    );

    docs.forEach((snapshot) => {
        ideas.push(Idea.fromJson(snapshot.data()));
    });

    switch (sort) {
        case "count":
            ideas = ideas.sort((a, b) => {
                return a.visit_count - b.visit_count;
            });
            break;
        case "post_date":
            ideas = ideas.sort((a, b) => {
                return a.post_date - b.post_date;
            });
            break;
        case "expiration_date":
            ideas = ideas.sort((a, b) => {
                return a.expiration_date - b.expiration_date;
            });
            break;
        default:
            break;
    }

    switch (asc) {
        case "asc":
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
    if (id) {
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

        res.status(200).json({
            success: true,
            code: 200,
            message: ideas,
        });
    } else {
        res.status(300).json({
            message: "No id was provided",
        });
    }
});

router.post("/", upload.array("items", 10), async (req, res) => {
    console.log("new item request");
    var fileNames = [];
    for (let i = 0; i < req.files.length; i++) {
        fileNames.push(req.files[i].filename);
    }

    var idea = new Idea(
        req.body.writer_id,
        req.body.approver_id,
        req.body.post_date,
        req.body.approved_date,
        req.body.category.split(","),
        req.body.title,
        req.body.content,
        fileNames,
        req.body.thread,
        req.body.visit_count,
        req.body.stat,
        req.body.is_anonymous
    );

    if (req.files) {
        console.log(req.files.path);
    } else {
        console.log("No files attached");
        return;
    }
    await addDocument(collectionRef, idea);

    for (let i = 0; i < req.body.category.split(",").length; i++) {
        console.log(req.body.category.split(",")[i]);
        var cat = await fetchDocumentById(
            Constants.CategoryRepository,
            req.body.category.split(",")[i]
        );
        console.log(cat.data());
        await updateDocument(
            Constants.CategoryRepository,
            req.body.category.split(",")[i],
            {
                idea: cat.data().idea + 1,
            }
        );
    }

    const receiver = req.body.approver_id;
    sendMail(receiver, "New post added", "Sender: " + req.body.writer_id);

    updateDocumentMetrics("Idea");
    console.log("Idea added, ID: " + req.body.id);

    res.status(200).send({
        success: true,
        message: idea,
    });
});

router.get("/accessed", async (req, res) => {
    if (id) {
        const id = req.query.id;
        const idea = await fetchDocumentById(collectionRef, id);
        if (idea) {
            var i = idea.data();
            i.visit_count = i.visit_count + 1;
            await updateDocument(collectionRef, id, i);
        }
        res.status(200);
    } else {
        res.status(300).json({ message: "No ID was provided" });
    }
});

router.put("/", async (req, res) => {
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
    const respond = await updateDocument(
        collectionRef,
        req.body.id,
        idea.toJson()
    );
    console.log("Idea updated, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
});

router.get("/delete", async (req, res) => {
    if (req.body.id) {
        const respond = await deleteDocument(collectionRef, req.body.id);
        console.log("Idea deleted, ID: " + req.body.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    } else {
        res.status(300).json({
            message: "No id was provided!",
        });
    }
});

export default router;
