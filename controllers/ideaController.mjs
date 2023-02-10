import express from "express";
const router = express.Router();

router.get('/', (req, res) => {
    const id = req.query.id;
    console.log('idea')
    res.send({ content: 'Idea page' });
})

router.post('/post', (req, res) => {

});

router.get('/addMock', (req, res) => {

});

router.post('/edit', (req, res) => {

})

router.post('/addComment', (req, res) => {

});

router.post('/react', (req, res) => {

});

export default router;

