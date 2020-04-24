import Sequelize, { Model } from 'sequelize';

class Appointment extends Model {
    static init(connection) {
        super.init({
            date: Sequelize.DATE,
            canceled_at: Sequelize.DATE,
        }, {
            sequelize: connection,
        });

        return this;
    }
}

export default Appointment;
