import express from "express";
import {
    addDocument,
    fetchAllMatchingDocuments,
    fetchDocumentById,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import * as Constants from "../utils/constants.mjs";
import { containsRole } from "../service/tokenAuth.mjs";
import {
    addMockComments,
    addMockIdeas,
    addMockReaction,
    clearDocument,
} from "../utils/mockHelper.mjs";

const router = express.Router();

router.post("/", containsRole("Admin"), async (req, res) => {
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

router.get("/clearMock", async (req, res) => {
    clearDocument("Comment");
    res.status(200).send({
        success: true,
        code: 200,
        message: "All ideas cleared",
    });
});

router.get("/addReaction", async (req, res) => {
    var count = parseInt(req.query.count);
    addMockReaction(100);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

router.get("/addComments", async (req, res) => {
    var count = parseInt(req.query.count);
    addMockComments(100);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

router.get("/Ideas", async (req, res) => {
    var count = parseInt(req.query.count);
    addMockIdeas(100);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

export default router;
