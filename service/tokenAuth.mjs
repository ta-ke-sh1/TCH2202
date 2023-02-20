import { initializeApp } from "firebase/app";
import {
    getFirestore,
    getDoc,
    doc,
    collection,
    query,
    where,
} from "firebase/firestore";
import * as constants from "./constants.mjs";
import "dotenv/config";
import jwt from "jsonwebtoken";

const { sign, verify } = jwt;

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);


function containsRole(role) {
    return function middle(req, res, next) {
        var token = req.get('Authorization')
        if (typeof (token) === 'undefined') {
            res.status(403).send({ success: false, code: 300, message: "No Token Provided." })
            return;
        }

        if (!token.startsWith('Bearer ')) {
            res.status(403).send({ success: false, code: 300, message: "No Token Provided." })
            return;
        }

        try {
            var decoded = jwt.verify(token.substring(7, token.length), process.env.JWT_SECRET);
        } catch (err) {
            res.status(403).send({ success: false, code: 401, message: err })
            return;
        }

        if (!decoded.role.includes(role)) {
            res.status(403).send({ success: false, code: 501, message: "Unauthorized role." })
        } else {
            var decoded = jwt.verify(token.substring(7, token.length), process.env.JWT_SECRET);
            req.decodedToken = decoded;
            next();
        }
    }
}


const register = async (object) => {
    var isExist = await isExists(username);
    if (isExist !== false) {
        return {
            code: "300",
            message: "User already existed!",
        };
    }

    try {
        const docRef = await addDoc(
            collection(db, constants.UserRepostiory),
            object.toJson(),
            object.username
        );
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "Error";
    }
};

const authorize = async (username, password) => {
    var user = await isExists(username);
    if (user === false) {
        return {
            code: "300",
            message: "no such document",
        };
    }

    console.log(user.data());

    const secret = process.env.JWT_SECRET;
    const payload = {
        user: user.id,
        role: user.data().role,
    };
    const options = { expiresIn: "2d" };

    const token = jwt.sign(payload, secret, options);

    return {
        code: "200",
        token: "Bearer " + token,
    };
};

const isExists = async (username) => {
    if (username == null) {
        return false;
    }
    const docRef = doc(db, constants.UserRepository, username);
    const querySnapshot = await getDoc(docRef);
    if (querySnapshot.exists()) {
        return querySnapshot;
    } else {
        return false;
    }
};

export { authorize, register, containsRole };
