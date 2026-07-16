const express = require('express');
const router = express.Router();
const workoutController = require('../controllers/workoutController');

router.get('/stats', workoutController.getStats);
router.get('/', workoutController.getAll);
router.get('/:id', workoutController.getById);
router.post('/', workoutController.create);
router.put('/:id', workoutController.update);
router.delete('/:id', workoutController.delete);

module.exports = router;
