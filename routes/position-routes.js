
const express = require('express');
const positionController = require('../controllers/position-controller');
const router = express.Router();

router.get('/', positionController.getPositions);
router.post('/', positionController.createPosition);
router.delete('/:id', positionController.deletePosition);

module.exports = router;
