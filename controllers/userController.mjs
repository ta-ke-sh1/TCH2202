import express from "express";
import * as ideaRepository from '../repository/ideaRepository.mjs';

const router = express.Router();

router.get('/', async (req, res) => {
    var idea = await ideaRepository.fetchIdeaById(res.query.id);
    res.send(idea.toJson());
})

export default router;
