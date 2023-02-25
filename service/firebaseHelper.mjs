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

const fetchAllMatchingDocumentsWithinRange = async (document, start, end) => {
    var documents = [];
    const q = query(
        collection(db, document),
        where("post_date", ">=", start),
        where("post_date", "<=", end)
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

const fetchDocumentById = async (collectionRef, id) => {
    if (id != null) {
        const docRef = doc(db, collectionRef, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("fetched");
            return docSnap;
        }
        return null;
    }

    return null;
};

const addDocument = async (collectionRef, object) => {
    try {
        const docRef = await addDoc(
            collection(db, collectionRef),
            object.toJson()
        );
        console.log("Document written with ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        return "Error";
    }
};

const deleteDocument = async (collectionRef, id) => {
    await deleteDoc(doc(db, collectionRef, id));
    return {
        code: 200,
        message: "Deleted user with id: " + id,
    };
};

const updateDocument = async (collectionRef, id, update_object) => {
    await setDoc(
        doc(db, collectionRef, id),
        update_object.toJson(),
        { capital: true },
        { merged: true }
    );
    return {
        code: 200,
        message: "Updated user with id: " + id,
    };
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
