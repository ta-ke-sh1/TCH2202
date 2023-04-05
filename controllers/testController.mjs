import express from "express";
import { containsRole } from "../service/tokenAuth.mjs";
import {
    addMockComments,
    addMockIdeas,
    addMockReaction,
    clearDocument,
    addMockMetrics,
    addMockUsers,
} from "../utils/mockHelper.mjs";
import { getCurrentDateAsDBFormat } from "../utils/utils.mjs";
import { fetchDepartmentReportByDuration } from "../service/metricsHelper.mjs";

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
    clearDocument("Reaction");
    res.status(200).send({
        success: true,
        code: 200,
        message: "All ideas cleared",
    });
});

router.get("/addReaction", async (req, res) => {
    var count = parseInt(req.query.count);
    addMockReaction(400);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

router.get("/addComments", async (req, res) => {
    var count = parseInt(req.query.count);
    addMockComments(200);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

router.get("/addIdeas", async (req, res) => {
    addMockIdeas(100);
    res.status(200).send({
        success: true,
        code: 200,
        message: count + " new ideas added",
    });
});

router.get("/addUsers", async (req, res) => {
    addMockUsers(100);
    res.status(200).send({
        message: "success",
    });
});

router.get("/addMetrics", async (req, res) => {
    addMockMetrics(42);
    res.status(200).send({
        message: "success",
    });
});

router.get("/testWhereId", async (req, res) => {
    console.log(Date.parse(getCurrentDateAsDBFormat()) / 1000);
    res.status(200).json("Hello");
});

router.get("/test", async (req, res) => {
    await fetchDepartmentReportByDuration(1, "ZbxTmrJKbT16HOSYPbN2");
    res.status(200).json("Hello");
});

export default router;
