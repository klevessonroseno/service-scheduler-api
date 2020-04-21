import User from '../models/User';
import * as Yup from 'yup';

class UserController {
    async store(req, res) {
        try {
            const schema = Yup.object().shape({

                name: Yup.string().required(),
                email: Yup.string().email().required(),
                password: Yup.string().required().min(6),

            });

            if(!req.body.name || !req.body.email || !req.body.password){
                return res.status(400).json({
                    error: 'The name, email and password attributes are required'
                });
            }

            if(!(await schema.isValid(req.body))) return res.status(400).json({
                error: 'Validation fails'
            });
     
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
        try {
            const schema = Yup.object().shape({

                name: Yup.string(),
                email: Yup.string().email(),
                oldPassword: Yup.string().min(6),
                password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => {
                   return oldPassword ? field.required() : field
                }),
                confirmPassword: Yup.string().when('password', (password, field) => {
                    return password ? field.required().oneOf([Yup.ref('password')]) : field
                })
            });

            if(!(await schema.isValid(req.body))) return res.status(400).json({
                error: 'Validation Fails'
            });

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
            
        } catch (error) {
            res.status(500).json(error);
        }
    }
}

export default new UserController();
