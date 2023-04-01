import { initializeApp } from "firebase/app";
import {
    getFirestore,
    addDoc,
    getDocs,
    setDoc,
    doc,
    deleteDoc,
    collection,
    updateDoc,
    getDoc,
    where,
    query,
    limit,
    orderBy,
    writeBatch,
    getCountFromServer,
} from "firebase/firestore";

import * as constants from "../utils/constants.mjs";
import { getCurrentDateAsFirestoreFormat } from "../utils/utils.mjs";
import moment from "moment";

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const updateDepartmentMetrics = async () => {};

const fetchDepartmentReportByDuration = async (duration, department) => {
    let date = getCurrentDateAsFirestoreFormat();
    var documents = [];

    for (let i = 0; i < duration; i++) {
        let d = moment(date).subtract(i).unix();
        console.log(d);
        const docRef = doc(db, "Department", department, "Metrics", "d-" + d);
        var snapshot = await getDoc(docRef);
        if (snapshot) {
            var obj = {};
            obj = snapshot.data();
            obj.timestamp = d;
            documents.push(obj);
        } else {
            documents.push({
                timestamp: d,
                post_count: 0,
                reaction_count: 0,
                comment_count: 0,
            });
        }
    }

    return documents;
};

export { updateDepartmentMetrics, fetchDepartmentReportByDuration };
