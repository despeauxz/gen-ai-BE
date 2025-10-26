import express from 'express';
import { SessionController } from '../controllers';
import { sessionSchema } from "../validate/app.validate";
import { validateData } from "../middleware/validation.middleware";

const router = express.Router();
export default router;

router.get('/', SessionController.listSessions);
router.get('/current', SessionController.currentSession);
router.post('/', validateData(sessionSchema), SessionController.addSession);
router.put('/:id', SessionController.updateSession);
router.put('/:id/current', SessionController.updateCurrentSession);
router.delete('/:id', SessionController.removeSession);