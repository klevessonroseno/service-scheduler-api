import Notification from '../schema/Notification';
import User from '../models/User';

class NotificationController {
    async index(req, res){
        try {
            const checkUserProvider = await User.findOne({
                where: { id: req.userId, provider: true },
            });
    
            if(!checkUserProvider) return res.status(401).json({
                error: 'Only providers can load notifications',
            });
    
            const notifications = await Notification.find({
                user: req.userId, 
            }).sort({ createdAt: 'desc' }).limit(20);
    
            return res.status(200).json(notifications);

        } catch (error) {
            return res.status(500).json(error);
        }
    }

    async update(req, res){
        const checkUserProvider = await User.findOne({
            where: { id: req.userId, provider: true },
        });

        if(!checkUserProvider) return res.status(401).json({
            error: 'Only providers can read their own notifications',
        });

        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true },
        );
        
        if(!notification) return res.status(404).json({
            error: 'Notification not found',
        });
        
        return res.status(200).json(notification);
    }
}

export default new NotificationController();
