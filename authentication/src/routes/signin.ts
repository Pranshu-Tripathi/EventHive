import express from 'express';

const router = express.Router();

router.post('/api/users/signin', (req, res) => {
    res.send('sigin.ts');
});

export { router as signinRouter };