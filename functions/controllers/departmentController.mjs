import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Deparment page');
})

export default router;
