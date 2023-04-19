import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { Department } from "../model/department.mjs";
import * as Constants from "../utils/constants.mjs";

const router = express.Router();
const collection = Constants.DepartmentRepository;

router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        const id = req.query.id;
        var snapshot = await fetchDocumentById(collection, id);
        if (snapshot) {
            var dept = Department.fromJson(snapshot.data(), snapshot.id)
            res.send(dept);
            return;
        }
    } else {
        const departments = [];
        var snapshots = await fetchAllDocuments(collection);
        console.log("Department Page");
        snapshots.forEach((snapshot) => {
            departments.push(Department.fromJson(snapshot.data(), snapshot.id));
        });
        res.send(departments);
    }
});

router.post("/", async (req, res) => {
    await addDocument(collection, {
        name: req.body.name,
        emp_count: 0,
    });
    console.log("New Department Added");
    console.log("Department added, ID: " + req.body.id);
});

router.put("/", async (req, res) => {
    if (!req.body.id) {
        res.status(300).json({
            message: "No id was provided!",
        });
    } else {
        const respond = await updateDocument(
            collection,
            department.id,
            department.toJson()
        );
        console.log("Department updated, ID: " + req.body.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

router.delete("/", async (req, res) => {
    if (!req.query.id) {
        res.status(300).json({
            message: "No id was provided!",
        });
    } else {
        const respond = await deleteDocument(collection, req.query.id);
        console.log("Department deleted, ID: " + req.query.id);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

export default router;
