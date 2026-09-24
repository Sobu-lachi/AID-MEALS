import express from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { authorize } from '../middlewares/authorize.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/dashboard', authenticate, authorize('admin'), (req, res) => {
    res.status(200).json({
        message: 'Welcome admin!',
        // user: req.user,
    });
});

export default dashboardRouter;