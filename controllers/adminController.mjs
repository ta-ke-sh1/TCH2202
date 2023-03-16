import express from "express";
import {
    addDocument,
    fetchAllDocuments,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsCount,
    fetchDocumentById,
    updateDocument,
    fetchDocumentWhereDocumentId,
} from "../service/firebaseHelper.mjs";
import { Idea } from "../model/idea.mjs";
import { zip } from "zip-a-folder";
import * as path from "path";
import { containsRole } from "../service/tokenAuth.mjs";
import { appendFileSync } from 'fs';
import fs from "fs";
import { getCurrentDateAsDBFormat } from "../utils/utils.mjs";
import moment from 'moment';

const router = express.Router();

const collectionRef = 'Metrics';

router.get('/popularTags', async (req, res) => {
    const duration = req.body.duration;
    var ideaCount = [];
    var commentCount = [];
    var iteration = 7;
    var ideas = [];

    if (duration == 'month') {
        iteration = 30;
    }

    const tags = await fetchAllDocuments('Category');
    const tagMap = [];
    for (let i = 0; i < tags.length; i++) {
        if (!tagMap.find(e => e.id == tags[i].id)) {
            tagMap.push({
                id: tags[i].id,
                count: 0
            })
        }
    }

    const departments = await fetchAllDocuments('Department');
    const departmentMap = [];
    for (let i = 0; i < departments.length; i++) {
        if (!departmentMap.find(e => e.id == departments[i].id)) {
            departmentMap.push({
                id: departments[i].id,
                name: departments[i].data().name,
                count: 0
            })
        }
    }
    console.log(departmentMap);

    for (let i = 0; i < iteration; i++) {
        const d = moment().subtract(i, 'days').format('YYYY/M/D');
        const i_count = await fetchAllMatchingDocuments('Idea', 'post_date', d);
        const c_count = await fetchAllMatchingDocumentsCount('Comment', 'date', d);

        ideas.push(i_count);
        commentCount.push(c_count);
    }

    for (let i = 0; i < ideas.length; i++) {
        if (ideas[i].length > 0) {
            var sum = 0;
            for (let j = 0; j < ideas[i].length; j++) {
                sum += parseInt(ideas[i][j].data().visit_count);
                var catList = ideas[i][j].data().category;

                for (let k = 0; k < catList.length; k++) {
                    var tag = tagMap.findIndex((obj => obj.id === catList[k]))
                    tagMap[tag].count = tagMap[tag].count + 1;
                }

                var user = await fetchDocumentById('User', ideas[i][j].data().writer_id);
                if (user !== null) {
                    var index = departmentMap.findIndex((obj => obj.id === user.data().department_id))
                    departmentMap[index].count = departmentMap[index].count + 1;
                }
            }
            ideaCount.push(ideas[i].length);
        } else {
            ideaCount.push(0);
        }
    }

    res.status(200).json({
        tag_count: tagMap,
        ideaByDepartment: departmentMap
    });
});

router.get('/dashboard', async (req, res) => {
    var limit = req.query.limit;
    var snapshots = await fetchDocumentWhereDocumentId('Metrics', limit, { isBefore: Date.parse(getCurrentDateAsDBFormat()) / 1000 })
    console.log(snapshots);
    res.status(200).json(snapshots.reverse());
});

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

router.get("/createThreadReport", async (req, res) => {
    const id = req.query.thread;
    var thread = await fetchDocumentById('thread', id);
    var currentDateTime = new Date();
    if (!thread) {
        res.status(300).send({
            message: 'Thread does not exist!'
        })
    }
    else if (thread.data().endDate > currentDateTime.getTime() / 1000) {
        res.status(300).send({
            message: 'Not yet expired!'
        });
    } else {
        const ideas = await fetchAllMatchingDocuments('Idea', 'thread', id);
        var dir = path.resolve() + "/summary_file/csv/";

        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        var fileName = dir + 'Thread Summary-' + id + ".csv";
        appendFileSync(fileName, "Writer Id\tApprover Id\tPost Date\tApproved Date\tCategory\tContent\tFile\tThread ID\tVisit Count\tStatus\tIs_anonymous\n");
        for (let i = 0; i < ideas.length; i++) {
            appendFileSync(fileName, Idea.fromJson(ideas[i].data()).toCSV());
        }

        res.status(300).send({
            message: 'You can download now!',
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
