import { Idea } from "../model/idea.mjs";
import { getRndInteger } from "./utils.mjs";
import { uniqueNamesGenerator, names } from "unique-names-generator";
import * as Constants from "../service/constants.mjs";
import { initializeApp } from "firebase/app";
import {
    writeBatch,
    doc,
    getFirestore,
    collection,
    addDoc,
} from "firebase/firestore";

const app = initializeApp(Constants.firebaseConfig);
const db = getFirestore(app);

const ideaCollectionRef = Constants.IdeaRepository;
const userCollectionRef = Constants.UserRepository;

const loremIpsum =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus vulputate libero in finibus laoreet. Suspendisse dignissim ultricies tortor in iaculis. Nam in nunc tellus. Vivamus vitae congue elit, vel auctor nunc. In dui risus, sodales non gravida in, ultrices sit amet mi. Ut eget quam dictum, mollis turpis eget, venenatis lectus. Aliquam auctor lectus velit, ut finibus mi pellentesque vitae. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.";

async function addMockUsers() {
    const roles = {
        1: "1D17R3ozi5G8Ih12H4CV",
        2: "HrBpfqyOOPVomC6FuyPM",
        3: "TnKVhc7Euaskx4W9n3sW",
        4: "ZbxTmrJKbT16HOSYPbN2",
        5: "s4sXB2J5q6Zx1f4qIIwB",
    };

    const users = [];
    for (let i = 0; i < 20; i++) {
        var name =
            uniqueNamesGenerator({
                dictionaries: [names],
            }) +
            uniqueNamesGenerator({
                dictionaries: [names],
            });
        var user = new User(
            roles[getRndInteger(1, 5)],
            name.toLowerCase(),
            "123456",
            name,
            getRndInteger(1990, 2004) +
                "/" +
                getRndInteger(1, 12) +
                "/" +
                getRndInteger(1, 30),
            ["Staff"],
            "+840" + getRndInteger(30, 99) + getRndInteger(100000, 999999),
            "Activated",
            "/avatar/" + name.replace(" ", "").toLowerCase(),
            name.replace(" ", "") + "@gmail.com"
        );
        users.push(user);
    }

    var batch = writeBatch(db);

    users.forEach((user) => {
        const docRef = doc(db, userCollectionRef, user.username);
        console.log(user.toJson());
        batch.set(docRef, user.toJson());
    });

    await batch.commit();
}

async function addMockIdeas() {
    const categories = {
        1: "6K2FKDZrQFqBMuTGfWbF",
        2: "6jW18cQZTepmgC6bwM3w",
        3: "80rj9FwqP4veSRah2qHk",
        4: "Rl2zj0QFjr5mzrxdufxx",
        5: "lzeroeitwiyxfE9c46LA",
    };

    const users = {
        1: "pepievelyn",
        2: "pollysindee",
        3: "andriettefiann",
        4: "jocelinlolita",
        5: "alixevey",
        6: "bertiemyrtice",
        7: "concordiajoyan",
        8: "ivettanestassia",
        9: "danyaleoline",
        10: "rozaliedrucy",
    };

    for (let i = 0; i < 40; i++) {
        var idea = new Idea(
            users[getRndInteger(1, 10)],
            "admin",
            categories[getRndInteger(1, 5)],
            loremIpsum,
            "",
            "2023" + "/" + getRndInteger(1, 12) + "/" + getRndInteger(1, 30),
            "2023" + "/" + getRndInteger(1, 12) + "/" + getRndInteger(1, 30),
            0,
            "Approved",
            false
        );
        await addDoc(collection(db, ideaCollectionRef), idea.toJson());
    }
}

async function clearDocument(collection) {
    var documents = await fetchAllDocuments(collection);
    documents = documents.filter((x) => {
        return x.id !== "admin";
    });

    var batch = writeBatch(db);
    documents.forEach((user) => {
        const docRef = doc(db, collection, user.id);
        batch.delete(docRef);
    });
}

export { addMockIdeas, addMockUsers, clearDocument };
