import express from "express";
import { initializeApp } from "firebase/app";
import {
    addDocument,
    fetchDocumentById,
    updateDocument,
    fetchAllDocuments,
} from "../service/firebaseHelper.mjs";

import {
    getFirestore,
    setDoc,
    doc,
} from "firebase/firestore";
import * as constants from "../utils/constants.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const router = express.Router();
const collectionRef = 'Category';

router.get('/', async (req, res) => {
    const categories = [];
    const snapshots = await fetchAllDocuments(collectionRef);
    for (let i = 0; i < snapshots.length; i++) {
        categories.push({
            id: snapshots[i].id,
            addedBy: snapshots[i].data()['addedBy']
        })
    }
    res.status(200).json(categories);
})

router.get('/delete', async (req, res) => {
    const respond = await deleteDocument(collectionRef, req.body.id);
    console.log("Comment deleted, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
})

router.post('/add', async (req, res) => {
    const name = req.body.name;
    const adder = req.body.adder;
    await setDoc(
        doc(db, collectionRef, name),
        {
            addedBy: adder
        }
    );
    res.status(200);
})


export default router;