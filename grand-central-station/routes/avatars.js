var express = require('express')
    , router = express.Router()

;

/**
  Avatars index page - render all those avatars which are tagged as 'running' (should be running - not paused)
 */
router.get('/', authMiddleware, (req, res) => {
    app.get('avatars').find({}, { name: 1, running: 1 }).toArray((err, avatarRecords) => {
        if (err) {
            console.error(err)
            return res.status(500).json(err)
        }
        Cleric.getRunningAvatars((livingErr, living) => {
            if (err) {
                app.get('logger').error(`Error getting living avatars; ${livingErr}`)
            }
            //Tag the avatar with its true current running status
            avatarRecords.forEach( avatar => avatar.living = (living.indexOf(avatar.name) != -1) ? true : false )
            return res.status(200).json(avatarRecords)
        })
    })
})

/**
 * Control an avatar by supplying its name and either "pause" or "start"
 *
 * First ensures avatar status at the process level before starting or stopping an avatar
 *
 * @param  {avatar} req.body.avatar - The name of the avatar to control
 * @param  {command} req.body.command  - The command to issue
 */
router.post('/control', authMiddleware, (req, res) => {
    let
        avatar = req.body.avatar,
        command = req.body.command

    //Pause an avatar
    if (false === command) {
        app.get('logger').info(`GCS received stop command for ${avatar}`)

        Cleric.modifyAvatarRunningStatusByName(avatar, false, (stopErr, stopStatus) => {
            if (stopErr) {
                app.get('logger').error(`Error stopping avatar ${avatar} : ${stopErr}`)
                res.status(500).end(`There was an issue stopping ${avatar}`)
            }
            if (stopStatus && stopStatus.status === 'success') {
                app.get('logger').info(`GCS successfully stopped ${avatar}`)
                res.status(200).end(`Successfully stopped ${avatar}`)
            }
        })

        //Start an avatar
    } else if (true === command) {
        //Ensure avatar is not already running
        Cleric.modifyAvatarRunningStatusByName(avatar, true, (startErr, startStatus) => {
            if (startErr) {
                app.get('logger').error(`Error starting avatar ${avatar} : ${startErr}`)
                res.status(500).end(`There was an issue starting ${avatar}`)
            }
            if (startStatus && startStatus.status === 'success') {
                app.get('logger').info(`GCS successfully started ${avatar}`)
                res.status(200).end(`Successfully started ${avatar}`)
            }
        })
    } else {
        res.status(400).end(`Bad command`)
    }

})

/**
 * Get status info for a particular avatar
 *
 * @return {String} status  - "running" if the avatar is live or "paused"
 */
router.get('/status/:avatar', (req, res) => {
    var avatar = req.params.avatar

    app.get('logger').info(`Grand Central Station checking avatar: ${avatar} status`)

    Cleric.checkAvatarByName(avatar, (checkErr, status) => {
        if (checkErr) app.get('logger').error(`Error getting avatar status: ${checkErr}`)
        res.status(200).json({ avatar: avatar, running: status })
    })
})

router.get('/:avatarname', authMiddleware, (req, res) => {

    app.get('avatars').find({ name: req.params.avatarname }).toArray((err, doc) => {
        if (err) console.error(err)
        res.status(200).render('avatar-view', { title: 'Avatar ' + req.params.avatarname, avatar: doc[0], gcs_api_root: app.get('gcs_api_root') })
    })

})


/**
 * Get list of all avatars known to the Grand Central Station system
 */
router.get('/masterlist', (req, res) => {

    app.get('avatars').find({}, { name: 1 }).toArray((err, docs) => {

        if (err) console.error(err)

        res.status(200).json(docs)
    })
})

/**
 * Get a single config object for a given avatar
 *
 * @param  {String} avatarname - The name of the avatar whose config should be looked up
 */
router.get('/config/:avatar', authMiddleware, (req, res) => {

    //When serving an avatar's config, join Hivemind global lists to Avatar's config
    app.get('avatars').find({ name: req.params.avatar }, { config: 1 }).toArray((err, avatar_object) => {

        if (err) {
          app.get('logger').error(`Error fetching ${req.params.avatar} config: ${err}`)
          return res.status(500).json({ success: false, err: err })
        }
        console.dir(avatar_object)
        res.status(200).json(avatar_object)
    })
})

/**
 * Add a list-style item to an avatar config section
 * @param  {String}   req.body.avatarname - The name of the avatar to be modified
 * @param  {String}   req.body.sectionname - The name of the parent object containing the item to be added
 * @param  {String}   req.body.fieldname - The name of the field to be modified
 */
router.post('/config/:avatar/list/item', (req, res) => {

    var
        update_object = {},
        avatar = req.params.avatar,
        section = req.body.section,
        fieldname = req.body.fieldname,
        field_selector = `config.${section}.${fieldname}`,
        projection_field = String(field_selector)

    update_object[field_selector] = req.body.value

    app.get('avatars').update({ name: avatar }, { $push: update_object }, (err, doc) => {
        if (err) {
            console.error(err)
            app.get('logger').error(`Error updating ${avatar} config list item: ${err}`)
        }

        app.get('avatars').find({ name: avatar }).toArray((err, doc) => {

            res.status(200).send({ doc: doc[0] })
        })
    })
})

/**
 * Delete a list-style item from an avatar's config
 *
 * @param {String} avatarname - The name of the avatar whose config should be modified
 * @param {String} sectionname - The name of the parent object containing the item to be deleted
 * @param {String} fieldname - The name of the item to be deleted
 */
router.delete('/config/:avatar/list/item', authMiddleware, (req, res) => {

    var
        update_object = {},
        avatar = req.params.avatar,
        section = req.body.section,
        fieldname = req.body.fieldname,
        field_selector = `config.${section}.${fieldname}`,
        projection_field = String(field_selector)
    ;

    update_object[field_selector] = req.body.value

    app.get('avatars').update({ name: avatar }, { $pull: update_object }, (err, doc) => {

        if (err) {
          app.get('logger').error(err)
          res.status(500).json({ success: false, err: err })
        }

        console.log('should have succeeded?')

        app.get('avatars').find({ name: avatar }).toArray((err, doc) => {
            if (err) console.error(err)
            console.dir(doc[0])
            res.status(200).send({ status: 'success', update_data: doc[0] })
        })
    })
})

/**
 * Modify a given string field on an avatar's config
 * @param  {String}   req.body.avatarname - The name of the avatar whose config will be modified
 * @param  {String}   req.body.sectionname - The name of the parent object containing the target field
 * @param  {String}   req.body.fieldname - The name of the field to be modified
 */
router.put('/config/:avatar/string', (req, res) => {

    var
        update_object = {},
        avatarname = req.params.avatar,
        section = req.body.section,
        field_selector = `config.${section}.${req.body.fieldname}`
    ;
    update_object[field_selector] = req.body.value

    console.dir(update_object)

    app.get('avatars').update({ name: avatarname }, { $set: update_object }, (err, doc) => {
        if (err) console.error(err)
        res.status(200).send({ status: 'success' })
    })
})

/**
 * Modify an avatar's timer
 * @param  {String} req.body.avatarname - The name of the avatar whose timer will be modified
 * @param {String}  req.body.sectionname - The parent object that contains the timer to be modified
 * @param {String}  req.body.timername - The name of the timer to be modified
 * @param {String}  req.body.timertype - The type of timer to be modified
 */
router.put('/config/:avatar/timer', (req, res) => {
    var
        update_object = {},
        avatarname = req.params.avatar,
        timername = req.body.timername,
        timertype = req.body.timertype,
        field_selector = `config.timers.${timername}.${timertype}`
    ;

    update_object[field_selector] = parseInt(req.body.value, 10)

    app.get('avatars').update({ name: avatarname }, { $set: update_object }, (err, doc) => {
        if (err) console.error(err)
        res.status(200).send({ doc: doc[0] })
    })
})


module.exports = router