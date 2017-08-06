var express = require('express')
    , router = express.Router()

/**
 * Handle naked lookups in addition to www.grandcentralstation.com
 */
router.get('/', (req, res, next) => {
    //Accept and serve requets without www.
    if (req.headers.host.match('/^www/') !== null) {
        return res.redirect('http://' + req.headers.host.replace('/^www\./', '') + req.url)
    } else {
        return next()
    }
})

/**
 * Serve admin client
 */
router.get('/', (req, res) => {
    res.render('index.html')
})

/**
 * Return a list of the currently running avatars
 *
 * @return {Object} live_avatars - array of avatar objects
 */
router.get('/running-avatars', authMiddleware, (req, res) => {
    //Inspect processes to get actually running avatars
    Cleric.getRunningAvatars((err, liveAvatars) => {
        res.status(200).json(liveAvatars)
    })
})

/**
 * Serve Hivemind data
 */
router.get('/hivemind', authMiddleware, (req, res) => {
    app.get('hivemind').find({}).toArray((err, docs) => {
        if (err) {
            console.error(err)
            return res.status(500).json(err)
        }
        docs.filter( doc => doc.data = doc[doc.name] )
        docs.filter( doc => delete doc[doc.name] )
        return res.status(200).json(docs)
    })
})

/**
 * Create a new avatar by name
 *
 * @param {String} req.body.name - The name of the new avatar to create
 */
router.post('/create-new-avatar', (req, res) => {

    //Ensure that user-specified name does not collide
    let proposed_name = req.body.name

    app.get('avatars').findOne({ name: proposed_name }, (err, doc) => {
        if (err) console.error(err)

        //If there is no record of the proposed name, we can send a successful response
        if (null == doc) {

            //Get seed schema
            let seed_data = require('./data/seed.json')
            seed_data.bot.name = proposed_name

            let avatar = { name: proposed_name, config: seed_data }

            app.get('avatars').save(avatar, (err, doc) => {
                if (err) console.error(err)
                //New avatar successfully created - send success response
                res.status(200).send({ status: "clear" })
            })

        } else {
            //Send http code for conflict
            res.status(409).json({ status: 'conflict' })
        }
    })
})

/**
 * Add a Hivemind item
 *
 * @param {String} type The type of item to add
 * @param {String} data The value of the item to add
 */
router.post('/hivemind/item', (req, res) => {
    //Mongo append to array field
    var update_object = {}
    update_object[req.body.type] = req.body.data

    app.get('hivemind').update({ name: req.body.type }, { $addToSet: update_object }, (err, doc) => {
        if (err) console.error(err)
        app.get('logger').info('Appended ' + req.body.data + ' to ' + req.body.type + ' field')

        app.get('hivemind').find({ name: req.body.type }).toArray((err, doc) => {
            if (err) console.error(err)

            res.status(200).json({ status: 'success', update_data: doc[0][req.body.type] })
        })
    })
})

/**
 * Delete a Hivemind item
 *
 * @param {String} type The type of item to delete
 * @param {String} data The value of the item to delete
 */
router.delete('/hivemind/item', (req, res) => {

    let update_object = {}
    update_object[req.body.type] = req.body.data

    app.get('hivemind').update({ name: req.body.type }, { $pull: update_object }, (err, doc) => {
        if (err) console.error(err)
        app.get('logger').info(`Removed ${req.body.data} from ${req.body.type} field`)

        app.get('hivemind').find({ name: req.body.type }).toArray((err, doc) => {
            if (err) console.error(err)

            res.status(200).send({ status: 'success', update_data: doc[0][req.body.type] })
        })
    })
})

module.exports = router