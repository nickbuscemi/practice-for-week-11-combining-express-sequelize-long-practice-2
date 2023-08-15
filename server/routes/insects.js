// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

/**
 * INTERMEDIATE BONUS PHASE 2 (OPTIONAL) - Code routes for the insects
 *   by mirroring the functionality of the trees
 */
// Your code here
const { Insect } = require('../db/models');
const { Op } = require('sequelize');

// get insects
router.get('/', async (req, res, next) => {
    let insects = [];

    try {
        insects = await Insect.findAll({
            attributes: ['id', 'name', 'description', 'territory'],
            order: [['id', 'ASC']]
        });

        res.json(insects);

    } catch(error) {
        next(error);
    }
});

// get insects/:id

router.get('/:id', async (req, res, next) => {
    let insect;

    try {
        // Your code here
        insect = await Insect.findByPk(req.params.id, {
            attributes: ['id', 'name', 'description', 'territory']
        });

        if (insect) {
            res.json(insect);
        } else {
            next({
                status: "not-found",
                message: `Could not find insect ${req.params.id}`,
                details: 'Insect not found'
            });
        }
    } catch(err) {
        next({
            status: "error",
            message: `Could not find insect ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

// post insects
router.post('/', async (req, res, next) => {
    try {
        const { name, description, territory, millimeters } = req.body;
        const existingInsect = await Insect.findOne({ where: { name: name }});
        if (existingInsect) return res.status(400).json({ error: 'Insect with this name already exists'});

        const newInsect = await Insect.create({
            name: name,
            description: description,
            territory: territory,
            millimeters: millimeters
        });

        res.json({
            data: newInsect,
            status: "success",
            message: "Successfully created new insect",
        });
    } catch(err) {
        next({
            status: "error",
            message: 'Could not create new insect',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

// delete insects/:id
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedCount = await Insect.destroy({ where: { id }});
        if (deletedCount === 0) {
            return next({
              status: "not-found",
              message: `Could not remove insect ${id}`,
              details: "Insect not found"
            });
        }
        res.json({
            status: "success",
            message: `Successfully removed Insect ${req.params.id}`,
        });
    } catch(err) {
        next({
            status: "error",
            message: `Could not remove Insect ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

// put insects/:id
router.put('/:id', async (req, res, next) => {
    try {
        // Your code here
        const { id } = req.params;
        const { name, description, territory, millimeters } = req.body;

        const insectToUpdate = await Insect.findByPk(id);

        if (!insectToUpdate) return res.status(404).json({ error: 'Insect not found'});

        // Update the tree
        insectToUpdate.name = name;
        insectToUpdate.description = description;
        insectToUpdate.territory = territory;
        insectToUpdate.millimeters = millimeters;

        await insectToUpdate.save();

        res.status(200).json({
            data: insectToUpdate,
            status: 'success',
            message:`sucessfully updated the insect ${req.params.id}`
        })
    } catch(err) {
        next({
            status: "error",
            message: 'Could not update new insect',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

// get insects/search/:value
router.get('/search/:value', async (req, res, next) => {
    try {
        
        const value = req.params.value;

        //fetch trees similar to provided value
        const insects = await Insect.findAll({
            where: {
                name: {
                    [Op.like]: `%${value}%`
                }
            },
            attributes: ['name', 'description', 'territory', 'millimeters'],
            order: [['id', 'ASC']]
        });
    

        res.json(insects);
    } catch(error) {
        next(error);
    }
});
// Export class - DO NOT MODIFY
module.exports = router;