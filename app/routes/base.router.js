import express from 'express';

const router = express.Router();
export default router;

router.get('/', (req, res) => {
    res.status(200).json({ message: 'Hello World' });
});

router.get('/health', (req, res) => {
	  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});