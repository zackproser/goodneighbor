var express = require('express')
  , router = express.Router()

//Admin manager app routes
router.use('/', require('./admin'))

//Avatar control routes
router.use('/avatars', require('./avatars'))

module.exports = router