// const env = {

//     resourcePath: "/var/www/MauStats/resourceUploads/",
//     // logFilePath: '/var/www/MauStats/admin/src/assets/download/withData/', //production
//     logFilePath: '/var/www/MauStats/logs/',
//     logFilePathDashboard: '/var/www/MauStats/dashboard/src/assets/download/', //production
//     // uploadFilePath: "/var/www/MauStats/uploadData/",
//     uploadFilePath: "/var/www/MauStats/deewar/containerdata/",
//     sliderPath: "/var/www/MauStats/sliderUploads/",
//     dbConfig: {
//         env: 'development',
//         db: 'mongodb://localhost:27017/mau_stats', //production
//         port: 27017,
//         hostIp: 'localhost',
//         radisPort: 6379
//     },
//     privateKey: process.env.APP_KEY,
//     oldPasswordCheckKey: process.env.PASSWORD_HISTORY,
//     geoJsonPath:process.env.GEOJSON_PATH

// }
// module.exports = env;
if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
    // MySQL connection with credentials
    db_connection ={
        host: process.env.DB_HOST,
        user: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306  // Default port for MySQL is 3306
    };
} else {
    // MySQL connection without credentials
    db_connection ={
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    };
}

const env = {
    
    importProgressFilePath: process.env.IMPORT_PROGRESS_FILE_PATH, //production
    uploadFilePath: process.env.UPLOAD_FILE_PATH, //production
    resourcePath: process.env.RESOURCE_PATH,
    exportData: process.env.EXPORT_DATA,
    logFilePath: process.env.LOG_FILE_PATH, //production
    sliderPath: process.env.SLIDER_FILE_PATH,
    surveyPath: process.env.SURVEY_RESOURCE,
    constantFilePath:process.env.CONSTANT_FILE_PATH,
    
    dbConfig: {
        env: process.env.ENV,
        db: db_connection,
        port: process.env.DB_PORT,
        hostIp: process.env.DB_HOST,
        radisPort: process.env.REDIS_PORT
    },
    privateKey: process.env.APP_KEY,
    oldPasswordCheckKey: process.env.PASSWORD_HISTORY,
    geoJsonPath:process.env.GEOJSON_PATH,
    mailhost:process.env.MAIL_HOST,
    mailport:process.env.MAIL_PORT,
    mailusername:process.env.MAIL_USERNAME,
    mailpass:process.env.MAIL_PASSWORD,
    mainformAddress: process.env.MAIL_FROM_ADDRESS,
    DOMAIN_URL : process.env.DOMAIN_URL,
    DATAMANAGER_URL: process.env.DATAMANAGER_URL,
    PREFIX_QUEUE: process.env.PREFIX_QUEUE,
    RABBITMQ_IP: process.env.RABBITMQ_IP,
    CHUNK_VALUE: process.env.CHUNK_SIZE

}
module.exports = env;
