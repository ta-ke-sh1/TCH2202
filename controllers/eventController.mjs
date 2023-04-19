import express from "express";
import {
    addDocument,
    fetchDocumentById,
    fetchAllDocuments,
    updateDocument,
    deleteDocument,
} from "../service/firebaseHelper.mjs";

import { Thread } from "../model/thread.mjs";

const router = express.Router();
const collectionRef = "thread";

router.get("/", async (req, res) => {
    var result = [];
    const id = req.query.id;
    if (id) {
        var snapshots = await fetchDocumentById(collectionRef, id);
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
        var threads = await fetchAllDocuments(collectionRef);
        for (let i = 0; i < threads.length; i++) {
            result.push({
                id: threads[i].id,
                name: threads[i].data().name,
                startDate: threads[i].data().startDate,
                closedDate: threads[i].data().closedDate,
                endDate: threads[i].data().endDate,
                description: threads[i].data().description,
                ideaCount: threads[i].data().ideaCount,
            });
        }
        res.status(200).json(result);
    }
});

router.post("/edit", async (req, res) => {
    if (!req.body.id) {
        res.status(300).json({
            message: "No id was provided!",
        });
    } else {
        var updateObj = {
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            closedDate: req.body.closedDate,
            description: req.body.description,
            name: req.body.name,
        };

        console.log(updateObj)

        // const respond = await updateDocument(
        //     collectionRef,
        //     req.body.id,
        //     updateObj
        // );
        res.status(200).json(respond);
    }
});

router.post("/", async (req, res) => {
    var event = new Thread(
        req.body.startDate,
        req.body.endDate,
        req.body.closedDate,
        0,
        req.body.name,
        req.body.description
    );
    const respond = await addDocument(collectionRef, event);
    res.status(200).json(respond);
});

router.delete("/", async (req, res) => {
    if (!req.query.id) {
        res.status(300).json({
            message: "No id was provided!",
        });
    } else {
        await deleteDocument(collectionRef, req.query.id);
        res.status(200);
    }
});

export default router;
