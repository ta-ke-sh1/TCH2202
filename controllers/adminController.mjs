import express from "express";
import {
    addDocument,
    fetchDocumentById,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import * as Constants from "../utils/constants.mjs";
import { zip } from "zip-a-folder";
import * as path from "path";
import { containsRole } from "../service/tokenAuth.mjs";

const router = express.Router();

router.post('/createThread', async (req, res) => {
    const name = req.body.name;
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;

    if (endDate < startDate) {
        res.status(300).send(
            { message: 'Invalid date', }
        )
    } else {
        const response = await addDocument('thread', {
            name: name,
            startDate: startDate,
            endDate: endDate,
        });

        if (response === 'Error') {
            res.status(300).send({
                message: 'Error adding document',
            })
        } else {
            res.status(200).send({
                message: 'New thread added, id: ' + response
            })
        }
    }
})

router.get("/", async (req, res) => {
    const id = req.query.thread;
    var thread = await fetchDocumentById('thread', id);
    var currentDateTime = new Date();
    console.log(currentDateTime.getTime() / 1000);
    if (!thread) {
        res.status(300).send({
            message: 'Thread does not exist!'
        })
    }
    else if (thread.data().endDate > currentDateTime.getTime() / 1000) {
        console.log(thread.data().endDate);
        res.status(300).send({
            message: 'Not yet expired!'
        });
    } else {
        console.log(thread.data().endDate);
        res.status(300).send({
            message: 'You can download now!'
        });
    }
});

router.get("/approve", containsRole("Admin"), async (req, res) => {
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

router.get("/zipDirectory", containsRole("Admin"), async (req, res) => {
    var _out =
        path.resolve() +
        "\\summary_file\\summary" +
        new Date().toJSON().slice(0, 10).replace(/-/g, "-") +
        ".zip";
    var _in = path.resolve() + "\\assets\\files\\";
    await zip(_in, _out);
    res.status(200).download(_out);
});

export default router;
