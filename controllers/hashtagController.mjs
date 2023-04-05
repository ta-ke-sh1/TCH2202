import express from "express";
import { initializeApp } from "firebase/app";
import {
    fetchAllDocuments,
    fetchDocumentById,
    deleteDocument,
} from "../service/firebaseHelper.mjs";

import { getFirestore, setDoc, doc } from "firebase/firestore";
import * as constants from "../utils/constants.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const router = express.Router();
const collectionRef = "Hashtag";

router.get("/", async (req, res) => {
    const hashtags = [];
    const snapshots = await fetchAllDocuments(collectionRef);
    for (let i = 0; i < snapshots.length; i++) {
        hashtags.push({
            id: snapshots[i].id,
        });
    }
    res.status(200).json(hashtags);
});

router.delete("/", async (req, res) => {
    if (!req.query.id) {
        res.status(300).send({
            message: "No id was provided",
        });
    } else {
        var hashtag = await fetchDocumentById(collectionRef, req.query.id);
        if (!hashtag) {
            res.status(300).send({
                message: "Hashtag does not exist!",
            });
        } else {
            const respond = await deleteDocument(collectionRef, req.query.id);
            console.log("Hashtag deleted, ID: " + req.query.id);
            res.status(respond.code).send({
                message: respond.message,
            });
        }
    }
});

router.post("/", async (req, res) => {
    const name = req.body.name;
    await setDoc(doc(db, collectionRef, name));
    res.status(200);
});

export default router;
