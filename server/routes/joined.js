// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import models - DO NOT MODIFY
const { Insect, Tree } = require('../db/models');
const { Op } = require("sequelize");

/**
 * PHASE 7 - Step A: List of all trees with insects that are near them
 *
 * Approach: Eager Loading
 *
 * Path: /trees-insects
 * Protocol: GET
 * Response: JSON array of objects
 *   - Tree properties: id, tree, location, heightFt, insects (array)
 *   - Trees ordered by the tree heightFt from tallest to shortest
 *   - Insect properties: id, name
 *   - Insects for each tree ordered alphabetically by name
 */
router.get('/trees-insects', async (req, res, next) => {
    let trees = [];

    trees = await Tree.findAll({
        attributes: ['id', 'tree', 'location', 'heightFt'],
        include: [
            {
                model: Insect,
                attributes: ['id', 'name'],
                through: { attributes: [] },
                order: [['name', 'ASC']],
                required: true,
            }
        ],
        order: [['heightft', 'DESC']],
    });

    res.json(trees);
});

/**
 * PHASE 7 - Step B: List of all insects with the trees they are near
 *
 * Approach: Lazy Loading
 *
 * Path: /insects-trees
 * Protocol: GET
 * Response: JSON array of objects
 *   - Insect properties: id, name, trees (array)
 *   - Insects for each tree ordered alphabetically by name
 *   - Tree properties: id, tree
 *   - Trees ordered alphabetically by tree
 */
router.get('/insects-trees', async (req, res, next) => {
    let payload = [];

    const insects = await Insect.findAll({
        attributes: ['id', 'name', 'description'],
        include: [
            {
                model: Tree,
                attributes: ['id', 'tree'],
                through: { attributes: [] },
                order: [['tree', 'ASC']],
            },
        ],
        order: [ ['name', 'ASC'] ],
    });
    for (let i = 0; i < insects.length; i++) {
        const insect = insects[i];
        const foundTree = await insect.getTrees({
            order: [['tree', 'ASC']]
        })
        payload.push({
            id: insect.id,
            name: insect.name,
            description: insect.description,
            trees: foundTree.map((tree) => ({
                id: tree.id,
                tree: tree.tree,
            })),
        });
    }

    res.json(payload);
});

/**
 * ADVANCED PHASE 3 - Record information on an insect found near a tree
 *
 * Path: /associate-tree-insect
 * Protocol: POST
 * Parameters: None
 * Request Body: JSON Object
 *   - Property: tree Object
 *     with id, name, location, height, size
 *   - Property: insect Object
 *     with id, name, description, fact, territory, millimeters
 * Response: JSON Object
 *   - Property: status
 *     - Value: success
 *   - Property: message
 *     - Value: Successfully recorded information
 *   - Property: data
 *     - Value: object (the new tree)
 * Expected Behaviors:
 *   - If tree.id is provided, then look for it, otherwise create a new tree
 *   - If insect.id is provided, then look for it, otherwise create a new insect
 *   - Relate the tree to the insect
 * Error Handling: Friendly messages for known errors
 *   - Association already exists between {tree.tree} and {insect.name}
 *   - Could not create association (use details for specific reason)
 *   - (Any others you think of)
 */
// Your code here
router.post('/associate-tree-insect', async (req, res) => {
    const { tree, insect } = req.body;

    try {
        // Check if tree ID is provided or create a new tree
        let treeInstance;
        if (tree.id) {
            treeInstance = await Tree.findByPk(tree.id);
        } else {
            treeInstance = await Tree.create({
                name: tree.name,
                location: tree.location,
                height: tree.height,
                size: tree.size
            });
        }

        // Check if insect ID is provided or create a new insect
        let insectInstance;
        if (insect.id) {
            insectInstance = await Insect.findByPk(insect.id);
        } else {
            insectInstance = await Insect.create({
                name: insect.name,
                description: insect.description,
                fact: insect.fact,
                territory: insect.territory,
                millimeters: insect.millimeters
            });
        }

        // Try to associate tree with insect, but check if already associated
        const alreadyAssociated = await treeInstance.hasInsect(insectInstance);
        if (alreadyAssociated) {
            return res.status(400).json({
                status: 'error',
                message: `Association already exists between ${treeInstance.tree} and ${insectInstance.name}`
            });
        }

        await treeInstance.addInsect(insectInstance);

        res.json({
            status: 'success',
            message: 'Successfully recorded information',
            data: treeInstance // You can adjust what data you want to return here
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Could not create association',
            details: error.message
        });
    }
});


// Export class - DO NOT MODIFY
module.exports = router;