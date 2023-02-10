import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    res.send('Auth page');
})

router.get('/login', (req, res) => {

})

router.get('/registration', (req, res) => {

})

export default router;