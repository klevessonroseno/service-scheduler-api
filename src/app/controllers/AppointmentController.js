import { startOfHour, parseISO, isBefore, format, subHours } from  'date-fns';
import pt from 'date-fns/locale/pt'
import * as Yup from 'yup';
import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schema/Notification';

class AppointmentController {
    async index(req, res){
        try {
            const { page = 1 } = req.query;
            /**
             *  Listing all schedules for ordinary users
             */
            const appointments = await Appointment.findAll({
                where: { user_id: req.userId, canceled_at: null },
                order: ['date'],
                attributes: ['id', 'date'],
                limit: 20,
                offset: (page - 1) * 20,
                include: [
                    {
                        model: User,
                        as: 'provider',
                        attributes: ['id', 'name'],
                        include: [
                            {
                                model: File,
                                as: 'avatar',
                                attributes: ['id', 'path', 'url'],
                            },
                        ],
                    },
                ],
            });

            if(!appointments) return res.status(404).json({
                error: 'Appointments not found',
            });

            return res.status(200).json(appointments);

        } catch (error) {
            return res.status(500).json({ error });
        }
    }

    async store(req, res){
        try {
            const schema = Yup.object().shape({
                provider_id: Yup.number().required(),
                date: Yup.date().required(),
            });

            if(!(await schema.isValid(req.body))) return res.status(400).json({
                error: 'Validation Fails',
            });

            const { provider_id, date } = req.body;

            const checkIsProvider = await User.findOne({
                where: { id: provider_id, provider: true },
            });

            /**
             * Checking if provider_id is a provider
             */

            if(!checkIsProvider){
                return res.status(401).json({
                    error: 'You can only create appointments with providers',
                });
            }

            /**
             * Checking if the user id is the same as the provider id
             */

            if(checkIsProvider.id === req.userId) return res.status(401).json({
                error: 'You cannot create an appointment with yourself',
            });

            /**
             * Check for past dates
             */

             const hourStart = startOfHour(parseISO(date));

             if(isBefore(hourStart, new Date())){
                return res.status(400).json({
                    error: 'Past dates are not permitted',
                });
             }

             /**
              * Check date availability
              */
            const checkAvailability = await Appointment.findOne({
                where: {
                    provider_id,
                    canceled_at: null,
                    date: hourStart,
                }
            });

            if(checkAvailability){
                return res.status(400).json({
                    error: 'Appointment date is not available',
                });
            }

            /**
             * Notifying service provider 
             */

            const user = await User.findByPk(req.userId);
            const formattedDate = format(
                hourStart,
                "'dia' dd 'de' MMMM', às' H:mm'h'",
                { locale:  pt},
            );

            await Notification.create({
                content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
                user: provider_id,
            });

            const appointment = await Appointment.create({
                user_id: req.userId,
                provider_id,
                date: hourStart,
            });

            return res.status(201).json(appointment);

        } catch (error) {
            
        }
    }
    
    async delete(req, res){
        try {
            const appointment = await Appointment.findByPk(req.params.id);

            if(appointment.user_id !== req.userId) return res.status(401).json({
                error: 'You do not have permission to cancel this appointment',
            });

            if(appointment.canceled_at) return res.status(401).json({
                error: 'This appointment has been deleted',
            });

            const dateWithSub = subHours(appointment.date, 2);

            if(isBefore(dateWithSub, new Date())) return res.status(401).json({
                error: 'You can only cancel appointment 2 hours in advance', 
            });

            appointment.canceled_at = new Date();

            await appointment.save();

            return res.status(200).json(appointment);

        } catch (error) {
            return res.status(500).json(error);
        }
    }
}

export default new AppointmentController();
