const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        // Allowes only origins in the allowedOrigin array and no origin like postman
        if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
            /**
             * callback takes: 
             * null is an error
             * true is the allowed boolean
             */
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    // Allowes credential headers
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions