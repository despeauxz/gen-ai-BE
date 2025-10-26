import express from 'express';
import rateLimit from 'express-rate-limit';
import { validateData } from "../middleware/validation.middleware";
import { ExperimentController } from '../controllers';
import { experimentSchema } from '../validate/app.validate';

const experimentLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute
	max: 10,
	message: { error: 'Too many experiments created, please slow down.' },
});

const router = express.Router();
export default router;

router.get('/', ExperimentController.list);
router.get('/:id', ExperimentController.getExperiment);
router.get('/:id/sessions', ExperimentController.getExperimentsBySession);
router.post('/', experimentLimiter, validateData(experimentSchema), ExperimentController.addExperiment);
router.put('/:id', ExperimentController.updateExperiment);
router.delete('/:id', ExperimentController.removeExperiment);