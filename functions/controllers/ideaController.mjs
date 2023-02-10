import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    console.log('idea')
    res.send({ content: 'Idea page' });
})

router.post('/post', (req, res) => {

});

export default router;

