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

    async update(req, res) {
        const { email, oldPassword } = req.body;

        const user = await User.findByPk(req.userId);

        if(email !== user.email){
            const userExists = await User.findOne({
                where: { email }
            });

            if(userExists) return res.status(400).json({
                error: 'User email must be unique'
            });
        }

        if(oldPassword && !(await user.checkPassword(oldPassword))){
            return res.status(401).json({ error: 'Password does not match'});
        }

        const { id, name, provider } = await user.update(req.body);

        return res.json({ id, name, email, provider });
    }
}

export default new UserController();
