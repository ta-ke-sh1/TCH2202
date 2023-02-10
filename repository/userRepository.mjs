import { initializeApp, applicationDefault, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

const fetchAllUsers = async () => {

}

const fetchUserById = async () => {

}

const addUser = async (user) => {
    const ref = db.collection(UserRepostiory).doc(user.id);
    const res = await ref.set(user);
    console.log(res);
}

const deleteUser = async (id) => {
    await db.collection(UserRepostiory).doc(id).delete();
}

const updateUser = async (id, user) => {
    const res = await db.collection(UserRepostiory).doc(id).set(user);
    console.log(res);
}

module.exports = {
    fetchAllUsers,
    fetchUserById,
    addUser,
    deleteUser,
    updateUser,
};