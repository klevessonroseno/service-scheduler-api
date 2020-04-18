import { Router } from 'express';
import User from './app/models/User';
const routes = new Router();

routes.get('/', (req, res) => res.json({ message: 'App is running'}));

routes.post('/users', async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
});


export default routes;