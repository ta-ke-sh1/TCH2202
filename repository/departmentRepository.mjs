import { initializeApp } from 'firebase/app';
import { getFirestore, addDoc, getDocs, doc, deleteDoc } from 'firebase/firestore';
import * as constants from './constants.mjs';
import { Department } from '../model/department.mjs';

const app = initializeApp(constants.firebaseConfig);
const db = getFirestore(app);

const fetchAllDepartments = async () => {
    const Departments = [];
    const querySnapshot = await getDocs(collection(db, constants.DepartmentRepository));
    querySnapshot.forEach((doc) => {
        Departments.push(Department.fromJson(doc));
    })
    return Departments;
}

const fetchDepartmentById = async (id) => {
    const docRef = doc(db, constants.DepartmentRepository, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
        return Department.fromJson(docSnap);
    } else {
        console.log("No such document!");
    }
}

const addDepartment = async (Department) => {
    try {
        const docRef = await addDoc(collection(db, constants.DepartmentRepository), Department.toJson())
        console.log("Document written with ID: ", docRef.id);
    } catch (e) {
        console.error("Error adding document: ", e);
    }

}

const deleteDepartment = async (id) => {
    await deleteDoc(doc(db, constants.DepartmentRepository, id));
}

const updateDepartment = async (id, new_Department) => {
    new_Department.id = null;
    await setDoc(doc(db, constants.DepartmentRepository, id), new_Department.toJson(), { capital: true }, { merged: true });
}

export {
    fetchAllDepartments,
    fetchDepartmentById,
    addDepartment,
    deleteDepartment,
    updateDepartment,
};