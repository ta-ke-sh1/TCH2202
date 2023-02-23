import { initializeApp } from "firebase/app";
import {
    getFirestore,
    addDoc,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    collection,
    getDoc,
    where,
    query,
    orderBy,
} from "firebase/firestore";
import * as constants from "./constants.mjs";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchAllDocuments = async (document) => {
    const documents = [];
    const querySnapshot = await getDocs(collection(db, document));
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchAllMatchingDocumentsWithinRange = async (
    document,
    start,
    end,
) => {
    var documents = [];
    const q = query(
        collection(db, document),
        where("post_date", ">=", start),
        where("post_date", "<=", end),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchAllMatchingDocuments = async (document, criteria, keyword) => {
    const documents = [];
    const q = query(collection(db, document), where(criteria, "==", keyword));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
        documents.push(doc);
    });
    return documents;
};

const fetchDocumentById = async (collection, id) => {
    if (id != null) {
        const docRef = doc(db, collection, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("fetched");
            return docSnap;
        }
        return null;
    }

    return null;
};

const addDocument = async (collection, object) => {
    try {
        const docRef = await addDoc(collection(db, document), object.toJson());
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "Error";
    }
};

const deleteDocument = async (collection, id) => {
    await deleteDoc(doc(db, collection, id));
};

const updateDocument = async (collection, id, update_object) => {
    await setDoc(
        doc(db, collection, id),
        update_object.toJson(),
        { capital: true },
        { merged: true }
    );
};

export {
    fetchAllDocuments,
    fetchAllMatchingDocuments,
    fetchAllMatchingDocumentsWithinRange,
    fetchDocumentById,
    addDocument,
    deleteDocument,
    updateDocument,
};
