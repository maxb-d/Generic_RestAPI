const { format } = require('date-fns')

// Getting v4 and renaming it uuid
const { v4: uuid } = require('uuid')

// Files
const fs = require('fs')
const fsPromises = require('fs').promises

const path = require('path')

const logEvents = async (message, logFileName) => {
    const dateTime = `${format(new Date(), 'ddMMyyyy\tHH:mm:ss')}`
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`

    try {
        // Check if the directory containing the logs exists and creates it if it doesnt
        if(!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await fsPromises.mkdir(path.join(__dirname, '..', 'logs'))
        }
        // Append to the correct log file or creates it and append
        await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem)
    } catch(err) {
        console.log(err)
    }
}

// Actual middleware
const logger = (req, res, next) => {
    // Logs every requests with its method/url/origin(protocol/hostname/port)
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log')
    
    // Console logs the request method and path of the request url
    console.log(`${req.method} ${req.path}`)

    /**
     * Calling the next middleware or controller (where eventually the request will be processed)
     * Logger comes first before request processing
     */
    next()
}

module.exports = { logEvents, logger }