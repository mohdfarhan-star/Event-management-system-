const express = require('express');
const router = express.Router();

const {
    createEvent,
    getEventsForUser,
    getAllEvents,
    updateEvent,
    deleteEvent,
    getEventById,
    getEventLogs
} = require('../controllers/Event');

// Event routes
router.post('/create', createEvent);
router.get('/all', getAllEvents);
router.get('/user/:userId', getEventsForUser);
router.get('/:eventId', getEventById);
router.put('/:eventId', updateEvent);
router.delete('/:eventId', deleteEvent);
router.get('/:eventId/logs', getEventLogs);

module.exports = router;
