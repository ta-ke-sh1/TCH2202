import express from "express";
import {
    addDocument,
    fetchAllMatchingDocuments,
    fetchDocumentById,
    updateDocument,
    setDocument,
} from "../service/firebaseHelper.mjs";
import * as Constants from "../utils/constants.mjs";
import { Reaction } from "../model/react.mjs";

const router = express.Router();
const reactionRef = Constants.ReactionRepository;

router.get("/", async (req, res) => {
    const document = req.query.document;
    const user = req.query.user;
    const reaction = parseInt(req.query.reaction);

    await setDocument(reactionRef, user + "-" + document, {
        reaction: reaction,
        idea: document,
        user: user,
    });

    res.status(200).send({ message: "reacted" });
});

router.get("/fetch", async (req, res) => {
    const document = req.query.document;
    var reactions = [];
    var snapshots = await fetchAllMatchingDocuments(
        reactionRef,
        "document",
        document
    );
    if (snapshots.length === 0) {
        res.status(200).json([]);
    } else {
        for (let i = 0; i < snapshots.length; i++) {
            reactions.push({
                document: document,
                user: snapshots[i].data().user,
                reaction: snapshots[i].data().reaction,
            });
        }
        res.status(200).json(reactions);
    }
});

export default router;
