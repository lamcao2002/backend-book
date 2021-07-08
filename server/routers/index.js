import express from 'express';

import loginRouter from './login';
import manipulationRouter from './manipulation-models';
import handlerVerifyUser from '../middleware/auth';

const router = express.Router();

router.use('/auth', loginRouter);
router.use('/', handlerVerifyUser, manipulationRouter);

export default router;
