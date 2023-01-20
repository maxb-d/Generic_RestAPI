require('dotenv').config()
const express = require('express')
const app = express() 
const path = require('path')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const corsOptions = require('./config/corsOptions')
const connectDB = require('./config/dbConn')

const mongoose = require('mongoose')
const { logEvents } = require('./middleware/logger')

const errorHandler = require('./middleware/errorHandler')
const { logger } = require('./middleware/logger')

const PORT = process.env.PORT || 3500

connectDB()

/**
 * Logger comes as the first middleware
 */
app.use(logger)

/**
 * Applying cors for cross origin acces
 */
app.use(cors(corsOptions))

/*******************************  
** 3 types of middleware: 
**    - Custom middleware
**    - Built-in middleware
**    - 3rd party middleware
*******************************/

/**  
 * Middleware are working like a waterfall so serving static files on top for example will apply to all routes requested
 * app.use generally used to apply middleware to all routes
 * app.{method} used to apply middleware to specific routes
 */

/**
 * Built-in middleware to extract form data submitted through url
 */ 
app.use(express.urlencoded({ extended: false}))

/**
 * Built-in middle to extract json data submitted through url
 * Lets the app receive and parse json
 */
app.use(express.json())

/**
 * Applying middleware to be able to parse cookies
 */
app.use(cookieParser())

/**
 * Built-in middleware to serve static files like applying css or other
 * (not really used today since we use things like React and we do not serve static
 * files but can be used to serve a welcome/splash page or other)
 */
app.use('/', express.static(path.join(__dirname, 'public')))

/**
 * Custom middleware to serve the splash page
 */
app.use('/', require('./routes/root'))

app.use('/users', require('./routes/userRoutes'))

/**
 * serving the 404 if the request makes it here
 */
app.all('*', (req, res) => {
    res.status(404)

    if(req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    } else if(req.accepts('json')) {
        res.json({ message: '404 Not Found'})
    } else {
        res.type('txt').send('404 Not Found')
    }
})

/**
 * Using the errorHandler at the end
 */
app.use(errorHandler)

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB')
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
})

mongoose.connection.on('err', err => {
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, "mongoErrLog.log")
})