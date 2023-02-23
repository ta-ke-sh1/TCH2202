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
import { User } from "../model/user.mjs";

const { sign, verify } = jwt;

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

function containsRole(role) {
    return function middle(req, res, next) {
        var token = req.get("Authorization");
        if (token === undefined) {
            res.status(401).send({
                success: false,
                message: "No Token Provided.",
            });
            return;
        }

        if (!token.startsWith("Bearer ")) {
            res.status(400).send({
                success: false,
                message: "Invalid token format.",
            });
            return;
        }

        try {
            var decoded = jwt.verify(
                token.substring(7, token.length),
                process.env.JWT_SECRET
            );
        } catch (err) {
            res.status(406).send({ success: false, message: err });
            return;
        }

        if (!decoded.role.includes(role)) {
            res.status(401).send({
                success: false,
                message: "You are unauthorized for this action!",
            });
        } else {
            var decoded = jwt.verify(
                token.substring(7, token.length),
                process.env.JWT_SECRET
            );
            req.decodedToken = decoded;
            next();
        }
    };
}

const register = async (object) => {
    var isExist = await isExists(username);
    if (isExist !== false) {
        return {
            code: 406,
            message: "User already existed!",
        };
    }

    try {
        const docRef = await addDoc(
            collection(db, constants.UserRepository),
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
            code: 406,
            message: "no such document",
        };
    }

    var u = User.fromJson(user.data());
    if (u.password != password) {
        return {
            code: 406,
            message: "Incorrect password!",
        };
    }

    var access_secret = process.env.JWT_SECRET_ACCESS;
    const accessToken = jwt.sign({
        user: user.id,
        email: user.email,
        role: user.data().role,
    }, access_secret, { expiresIn: "10m" });

    var refresh_secret = process.env.JWT_SECRET_REFRESH
    console.log(refresh_secret);
    const refreshToken = jwt.sign({
        user: user.id,
    }, refresh_secret, { expiresIn: "2d" });

    return {
        code: 200,
        accessToken: "Bearer " + accessToken,
        refreshToken: "Bearer " + refreshToken,
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

export { authorize, register, containsRole, isExists };
