import express from "express";
import {
    addDocument,
    fetchAllMatchingDocuments,
    fetchDocumentById,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import * as Constants from "../utils/constants.mjs";

const router = express.Router();
const reactionRef = Constants.ReactionRepository;

router.get('/', async (req, res) => {
    const idea = req.query.idea;
    const user = req.query.user;
    const reaction = parseInt(req.query.reaction);

    await updateDocument(reactionRef, idea + "-" + user, new React(idea + "-" + user, reaction));

    res.status(200).send({ message: 'reacted' });
})


export default router;