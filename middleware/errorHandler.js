const { logEvents } = require('./logger')

const errorHandler = (err, req, res, next) => {
    logEvents(`${err.name} : ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
    console.log(err.stack)

    /**
     * Sets the error status, if the response already has a status code take it, if not,
     * sets to status 500 (Server Error)
     */
    const status = res.statusCode ? res.status : 500 

    res.status(status)

    res.json({ message: err.message })
}

module.exports = errorHandler