import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
} from "../repository/firebaseHelper.mjs";
import { Department } from "../model/department.mjs";
import * as Constants from "../repository/constants.mjs";

const router = express.Router();
const collection = Constants.DepartmentRepository;

router.get("/", async (req, res) => {
    const departments = [];
    var snapshots = await fetchAllDocuments(collection);
    console.log("Department Page");
    snapshots.forEach((snapshot) => {
        departments.push(Department.fromJson(snapshot.data(), snapshot.id));
    });
    res.send(departments);
});

router.get("/", async (req, res) => {
    const id = req.query.id;
    var snapshot = await fetchDocumentById(collection, id);
    var dept = new Department();
});

router.post("/add", async (req, res) => {
    var department = new Department(null, req.body.name, 0);
    console.log(department);
    await addDocument(collection, department);
    console.log("New Department Added");
    console.log("Department added, ID: " + req.body.id);
});

router.post("/edit", async (req, res) => {
    var department = new Department(
        req.body.id,
        req.body.name,
        req.body.emp_count
    );
    await updateDocument(collection, department.id, department);
    console.log("Department updated, ID: " + req.body.id);
});

router.get("/delete", async (req, res) => {
    await deleteDocument(collection, req.body.id);
    console.log("Department deleted, ID: " + req.body.id);
});

export default router;