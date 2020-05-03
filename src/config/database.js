module.exports = {
    dialect: 'postgres',
    host: 'localhost',
    username: 'postgres',
    password: 'docker',
    database: 'service_scheduler',
    define: {
        timestamps: true,
        underscored: true,
        underscoredAll: true,
    },
};