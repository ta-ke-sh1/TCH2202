import express from "express";
import {
    fetchAllDocuments,
    fetchDocumentById,
    deleteDocument,
    updateDocument,
} from "../service/firebaseHelper.mjs";
import { register } from "../service/tokenAuth.mjs";
import { User } from "../model/user.mjs";
import * as Constants from "../utils/constants.mjs";
import bcrypt from "bcryptjs";
import { getStorage, ref, uploadBytes } from "firebase/storage";
import * as path from "path";

import { addMockUsers, clearDocument } from "../utils/mockHelper.mjs";

const router = express.Router();
const collectionRef = Constants.UserRepository;
const storage = getStorage();

import multer from "multer";
var upload = multer({ storage: multer.memoryStorage() });


router.get("/", async (req, res) => {
    const id = req.query.id;
    if (id) {
        var snapshot = await fetchDocumentById(collectionRef, id);
        if (snapshot) {
            var dept = User.fromJson(snapshot.data(), snapshot.id);
            res.status(200).send(dept);
        }
        res.status(400).send({
            success: false,
            code: 400,
            message: "Document does not exist!",
        });
    } else {
        const users = [];
        var snapshots = await fetchAllDocuments(collectionRef);
        console.log("User Page");
        snapshots.forEach((snapshot) => {
            users.push(User.fromJson(snapshot.data(), snapshot.id));
        });
        res.send(users);
    }
});


router.post('/testFirestoreStorage', upload.single('avatar'), async (req, res) => {
    const user = req.body.user;
    console.log(req.file);
    if (req.file) {
        const storage = getStorage();
        const filename = user + path.extname(req.file.originalname);
        console.log(filename);
        const storageRef = ref(storage, '/avatar/' + filename);

        uploadBytes(storageRef, req.file.buffer).then((snapshot) => {
            res.status(200).send({
                message: 'Avatar saved to ' + storageRef
            })
        })
    } else {
        res.status(300).send({
            message: 'no files'
        })
    }
})

router.post("/add", upload.single('avatar'), async (req, res) => {
    var avatarPath = "";
    if (req.file) {
        const filename = user + path.extname(req.file.originalname);
        console.log(filename);
        avatarPath = ref(storage, '/avatar/' + filename);
    } else {
        avatarPath = "gs://tch2202-a782d.appspot.com/avatar/default.jpg"
    }

    var user = new User(
        req.body.department_id,
        req.body.username,
        bcrypt.hashSync(req.body.password, 10),
        req.body.fullName,
        req.body.dob,
        req.body.role,
        req.body.phone,
        req.body.stat,
        avatarPath,
        req.body.email
    );

    var result = await register(user);

    if (result.code === 200) {
        uploadBytes(avatarPath, req.file.buffer);
    }

    res.status(result.code).json({
        message: result.message,
    });
});

router.get("/clearDatabase", async (req, res) => {
    clearDocument(collectionRef);
    res.status(200).send({ success: true, message: "Deleted all mock users" });
});

router.get("/addMock", async (req, res) => {
    addMockUsers();
    res.status(200).send({
        success: true,
        code: 200,
        message: "20 new users added",
    });
});

router.post("/edit", upload.single('avatar'), async (req, res) => {
    var user = await fetchDocumentById(collectionRef, req.body.id);

    if (!user) {
        res.status(300).send({
            message: 'User doesn\'t exists!',
        })
    } else {
        var updateObj = {
            department_id: req.body.department_id,
            fullName: req.body.fullName,
            dob: req.body.dob,
            role: req.body.role,
            stat: req.body.stat,
            email: req.body.email,
        }

        if (req.file) {
            const filename = user.id + path.extname(req.file.originalname);
            console.log(filename);
            updateObj.avatar = ref(storage, '/avatar/' + filename);
        }

        const respond = await updateDocument(collectionRef, req.body.id, updateObj);
        res.status(respond.code).send({
            message: respond.message,
        });
    }
});

router.get("/delete", async (req, res) => {
    const respond = await deleteDocument(collectionRef, req.body.id);
    console.log("User deleted, ID: " + req.body.id);
    res.status(respond.code).send({
        message: respond.message,
    });
});

export default router;
