import jwt from 'jsonwebtoken';
import User from '../models/User';
import authConfig from '../../config/auth';

class SessionController {
    async store(req, res) {
        try {
            const { email, password } = req.body;

            if(!email || !password) return res.status(400).json({
                error: 'Email and password are required'
            });

            const user = await User.findOne({ where: { email }});
    
            if(!user) return res.status(404).json({
                error: 'User not found'
            });
    
            if(!(await user.checkPassword(password))) return res.status(401).json({
                error: 'Password does not math'
            });
    
            const { id, name } = user;
    
            return res.json({
                user: {
                    id,
                    name,
                    email,
                },
                token: jwt.sign({ id }, authConfig.secret, {
                    expiresIn: authConfig.expireIn,
                }),
            });
        } catch (error) {
            res.status(500).json(error);
        }
    }
}
export default new SessionController();
