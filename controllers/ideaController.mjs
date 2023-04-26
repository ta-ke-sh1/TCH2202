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
    setDocument,
    fetchUserById,
    fetchAllUsers,
    fetchAllUsersByDepartment,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../utils/constants.mjs";
import { sendMail, sendMailToCoordinator } from "../service/mail.mjs";

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
                closedDate: threads[i].data().closedDate,
                description: threads[i].data().description,
                ideaCount: threads[i].data().ideaCount,
            });
        }
        res.status(200).json(result);
    }
});

router.get("/department", async (req, res) => {
    const id = req.query.id;
    const thread = req.query.thread;
    if (thread && id) {
        var ideas = [];
        var writers = await fetchAllUsersByDepartment(id);
        console.log(writers);
        for (let i = 0; i < writers.length; i++) {
            var snapshots = await fetchAllMatchingDocuments(
                "Idea",
                "writer_id",
                writers[i].id
            );
            snapshots.forEach((snapshot) => {
                if (snapshot.data().thread === thread) {
                    ideas.push({
                        idea: Idea.fromJson(snapshot.data()),
                        id: snapshot.id,
                    });
                }
            });
        }
        res.status(200).send(ideas);
    }
    else if (id) {
        var ideas = [];
        var writers = await fetchAllUsersByDepartment(id);
        console.log(writers);
        for (let i = 0; i < writers.length; i++) {
            var snapshots = await fetchAllMatchingDocuments(
                "Idea",
                "writer_id",
                writers[i].id
            );
            snapshots.forEach((snapshot) => {
                ideas.push({
                    idea: Idea.fromJson(snapshot.data()),
                    id: snapshot.id,
                });
            });
        }
        res.status(200).send(ideas);
    } else {
        res.status(400).json({ message: "No id was provided" });
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
             var idea=Idea.fromJson(snapshot.data());
             idea.id = snapshot.id,
             ideas.push(idea);

        });
        res.status(200).send(ideas);
    }
});

router.get("/file", async (req, res) => {
    var username = req.query.username;
    var fileName = req.query.fileName;
    var __dirname = path.resolve(path.dirname(""));
    res.set({
        "Content-Disposition": `attachment; filename='${fileName}'`,
    });
    const file = `${__dirname}/assets/files/` + username + "/" + fileName;
    res.download(file);
});

router.get("/sortByLike", async (req, res) => {
    const thread = req.query.thread;
    const asc = req.query.asc;
    let ideas = [];

    console.log("thread id: " + asc);

    const docs = await fetchAllMatchingDocuments(
        collectionRef,
        "thread",
        thread
    );

    console.log("thread id idea count: " + docs.length);

    for (let i = 0; i < docs.length; i++) {
        var idea = Idea.fromJson(docs[i].data());
        var like = await fetchAllMatchingDocuments(
            "Reaction",
            "document",
            docs[i].id
        );
        idea.id = docs[i].id;
        idea.like_count = like.length;
        ideas.push(idea);
    }

    ideas = ideas.sort((a, b) => {
        return a.like_count - b.like_count;
    });

    const reversedArray = []

    for (let i = ideas.length - 1; i >= 0; i--) {
        const valueAtIndex = ideas[i]
        reversedArray.push(valueAtIndex)
    }

    asc === '0' ? res.status(200).json({ ideas: ideas }) : res.status(200).json({ ideas: reversedArray });
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
        req.body.category,
        req.body.title,
        req.body.content,
        fileNames,
        req.body.thread,
        req.body.visit_count,
        req.body.stat,
        req.body.is_anonymous,
        []
    );

    console.log(idea.toCSV());

    if (req.files) {
        console.log(req.files.path);
    } else {
        console.log("No files attached");
        return;
    }

    var user = await fetchUserById(req.body.writer_id);
    if (user.data().department_id) {
        console.log(user.data());
        sendMailToCoordinator(user.data().department_id, "");
    }

    await addDocument(collectionRef, idea);
    for (let i = 0; i < req.body.category.length; i++) {
        console.log(req.body.category[i]);
        var cat = await fetchDocumentById(
            Constants.CategoryRepository,
            req.body.category[i]
        );
        console.log(cat.data());
        await updateDocument(
            Constants.CategoryRepository,
            req.body.category[i],
            {
                idea: cat.data().idea + 1,
            }
        );
    }
    for (let i = 0; i < req.body.hashtag.length; i++) {
        var hashtag = await fetchDocumentById("Hashtag", req.body.hashtag[i]);
        if (!hashtag) {
            await setDocument("Hashtag", req.body.hashtag[i], {});
        }
    }

    updateDocumentMetrics("Idea");
    console.log("Idea added, ID: " + req.body.id);

    res.status(200).send({
        success: true,
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

router.post("/edit", async (req, res) => {
    var idea = new Idea(
        req.body.writer_id,
        req.body.approver_id,
        req.body.post_date,
        req.body.expiration_date,
        req.body.category,
        req.body.title,
        req.body.content,
        req.body.file,
        req.body.visit_count,
        req.body.stat,
        req.body.is_anonymous,
        []
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
