'use strict';
const { Insect, Tree } = require('../models');

const insectTreeData = [
  {
    insect: { name: "Western Pygmy Blue Butterfly" },
    trees: [
      { tree: "General Sherman" },
      { tree: "General Grant" },
      { tree: "Lincoln" },
      { tree: "Stagg" },
    ],
  },
  {
    insect: { name: "Patu Digua Spider" },
    trees: [
      { tree: "Stagg" },
    ],
  },
]

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    for (let insectIdx = 0; insectIdx < insectTreeData.length; insectIdx++) {
      const { insect, trees } = insectTreeData[insectIdx];
      const foundInsect = await Insect.findOne({ where: { name: insect.name }});

      for (let treeIdx = 0; treeIdx < trees.length; treeIdx++) {
        const tree = trees[treeIdx].tree;
        const foundTree = await Tree.findAll( { where: { tree }});

        await foundInsect.addTree(...foundTree);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    for (let insectIdx = 0; insectIdx < insectTreeData.length; insectIdx++) {
      const { insect, trees } = insectTreeData[insectIdx];
      const foundInsect = await Insect.findOne({ where: { name: insect.name }});

      for (let treeIdx = 0; treeIdx < trees.length; treeIdx++) {
        const tree = trees[treeIdx].tree;
        const foundTree = await Tree.findAll( { where: { tree }});

        await foundInsect.removeTree(...foundTree);
      }
    }
  },
};
