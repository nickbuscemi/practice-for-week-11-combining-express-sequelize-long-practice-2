// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

/**
 * BASIC PHASE 1, Step A - Import model
 */
// Your code here
const { Tree } = require('../db/models');
const { Op } = require('sequelize');

/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step A:
 *   Import Op to perform comparison operations in WHERE clauses
 **/
// Your code here

/**
 * BASIC PHASE 1, Step B - List of all trees in the database
 *
 * Path: /
 * Protocol: GET
 * Parameters: None
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/', async (req, res, next) => {
    let trees = [];

    // Your code here
    try {
        trees = await Tree.findAll({
            attributes: ['id', 'tree', 'heightFt'],
            order: [['heightFt', 'DESC']]
        });

        res.json(trees);

    } catch(error) {
        next(error);
    }
});

/**
 * BASIC PHASE 1, Step C - Retrieve one tree with the matching id
 *
 * Path: /:id
 * Protocol: GET
 * Parameter: id
 * Response: JSON Object
 *   - Properties: id, tree, location, heightFt, groundCircumferenceFt
 */
router.get('/:id', async (req, res, next) => {
    let tree;

    try {
        // Your code here
        tree = await Tree.findByPk(req.params.id, {
            attributes: ['id', 'tree', 'location', 'heightFt', 'groundCircumferenceFt']
        });

        if (tree) {
            res.json(tree);
        } else {
            next({
                status: "not-found",
                message: `Could not find tree ${req.params.id}`,
                details: 'Tree not found'
            });
        }
    } catch(err) {
        next({
            status: "error",
            message: `Could not find tree ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 2 - INSERT tree row into the database
 *
 * Path: /trees
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Properties: name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully created new tree
 *   - Property: data
 *     - Value: object (the new tree)
 */
router.post('/', async (req, res, next) => {
    try {
        const { name, location, height, size } = req.body;
        const existingTree = await Tree.findOne({ where: {tree: name }});
        if (existingTree) return res.status(400).json({ error: 'Tree with this name already exists'});

        const newTree = await Tree.create({
            tree: name,
            location: location,
            heightFt: height,
            groundCircumferenceFt: size
        });

        res.json({
            data: newTree,
            status: "success",
            message: "Successfully created new tree",
        });
    } catch(err) {
        next({
            status: "error",
            message: 'Could not create new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * BASIC PHASE 3 - DELETE a tree row from the database
 *
 * Path: /trees/:id
 * Protocol: DELETE
 * Parameter: id
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully removed tree <id>
 * Custom Error Handling:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not remove tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.delete('/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const deletedCount = await Tree.destroy({ where: { id }});
        if (deletedCount === 0) {
            return next({
              status: "not-found",
              message: `Could not remove tree ${id}`,
              details: "Tree not found"
            });
        }
        res.json({
            status: "success",
            message: `Successfully removed tree ${req.params.id}`,
        });
    } catch(err) {
        next({
            status: "error",
            message: `Could not remove tree ${req.params.id}`,
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * INTERMEDIATE PHASE 4 - UPDATE a tree row in the database
 *   Only assign values if they are defined on the request body
 *
 * Path: /trees/:id
 * Protocol: PUT
 * Parameter: id
 * Request Body: JSON Object
 *   - Properties: id, name, location, height, size
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully updated tree
 *   - Property: data
 *     - Value: object (the updated tree)
 * Custom Error Handling 1/2:
 *   If id in request params does not match id in request body,
 *   call next() with error object
 *   - Property: status
 *     - Value: error
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: <params id> does not match <body id>
 * Custom Error Handling 2/2:
 *   If tree is not in database, call next() with error object
 *   - Property: status
 *     - Value: not-found
 *   - Property: message
 *     - Value: Could not update tree <id>
 *   - Property: details
 *     - Value: Tree not found
 */
router.put('/:id', async (req, res, next) => {
    try {
        // Your code here
        const { id } = req.params;
        const { name, location, height, size } = req.body;

        const treeToUpdate = await Tree.findByPk(id);

        if (!treeToUpdate) return res.status(404).json({ error: 'Tree not found'});

        // Update the tree
        treeToUpdate.tree = name;
        treeToUpdate.location = location;
        treeToUpdate.heightFt = height;
        treeToUpdate.groundCircumferenceFt = size;

        await treeToUpdate.save();

        res.status(200).json({
            data: treeToUpdate,
            status: 'success',
            message:`sucessfully updated the tree ${req.params.id}`
        })
    } catch(err) {
        next({
            status: "error",
            message: 'Could not update new tree',
            details: err.errors ? err.errors.map(item => item.message).join(', ') : err.message
        });
    }
});

/**
 * INTERMEDIATE BONUS PHASE 1 (OPTIONAL), Step B:
 *   List of all trees with tree name like route parameter
 *
 * Path: /search/:value
 * Protocol: GET
 * Parameters: value
 * Response: JSON array of objects
 *   - Object properties: heightFt, tree, id
 *   - Ordered by the heightFt from tallest to shortest
 */
router.get('/search/:value', async (req, res, next) => {
    try {
        
        const value = req.params.value;

        //fetch trees similar to provided value
        const trees = await Tree.findAll({
            where: {
                tree: {
                    [Op.like]: `%${value}%`
                }
            },
            attributes: ['id', 'tree', 'heightFt'],
            order: [['heightFt', 'DESC']]
        });
    

        res.json(trees);
    } catch(error) {
        next(error);
    }
});

// Export class - DO NOT MODIFY
module.exports = router;