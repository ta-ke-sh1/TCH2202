import express from "express";
import {
    addDocument,
    fetchAllMatchingDocuments,
    fetchDocumentById,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../utils/constants.mjs";
import { zip } from "zip-a-folder";
import * as path from "path";
import { containsRole } from "../service/tokenAuth.mjs";
import { appendFileSync } from 'fs';
import fs from "fs";

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
    clearDocument('Comment');
    res.status(200).send({
        success: true,
        code: 200,
        message: "All ideas cleared",
    });
});

router.get("/addMock", async (req, res) => {
    var count = parseInt(req.query.count)
    addMockComments(100);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

export default router;