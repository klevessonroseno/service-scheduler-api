import User from '../models/User';

class UserController {
    async store(req, res) {
        try {
            const userExists = await User.findOne({
                where: { email: req.body.email }
            });    
            if(userExists) return res.status(400).json({
                error: 'Email must be unique'
            });    
            const { id, name, email, provider } = await User.create(req.body);
    
            res.status(201).json({ id, name, email, provider });

        } catch (error) {
            res.status(500).json(error);
        }
    }
}

export default new UserController();
