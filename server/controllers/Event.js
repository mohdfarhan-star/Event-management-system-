const Event = require('../models/Event');
const User = require('../models/User');
const moment = require('moment-timezone');

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { title, profiles, timezone, startDateTime, endDateTime } = req.body;

        if (!title || !profiles || !timezone || !startDateTime || !endDateTime) {
            return res.status(400).json({
                success: false,
                message: "All fields are mandatory",
            });
        }

        // Validate profiles exist
        const users = await User.find({ _id: { $in: profiles } });
        if (users.length !== profiles.length) {
            return res.status(400).json({
                success: false,
                message: "One or more profiles not found"
            });
        }

        // Convert dates to proper Date objects
        const startDate = new Date(startDateTime);
        const endDate = new Date(endDateTime);

        // Validate dates
        if (startDate >= endDate) {
            return res.status(400).json({
                success: false,
                message: "End date/time must be after start date/time"
            });
        }

        if (startDate < new Date()) {
            return res.status(400).json({
                success: false,
                message: "Start date/time cannot be in the past"
            });
        }

        const event = await Event.create({
            title,
            profiles,
            timezone,
            startDateTime: startDate,
            endDateTime: endDate,
        });

        const populatedEvent = await Event.findById(event._id).populate('profiles', 'name timezone');

        return res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: populatedEvent
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to create event"
        });
    }
};

// Get all events for a specific user
exports.getEventsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { timezone } = req.query;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const events = await Event.find({ profiles: userId })
            .populate('profiles', 'name timezone')
            .sort({ startDateTime: 1 });

        // Convert events to user's timezone if specified
        const userTimezone = timezone || user.timezone;
        const eventsWithTimezone = events.map(event => {
            const eventObj = event.toObject();
            eventObj.startDateTime = moment(event.startDateTime).tz(userTimezone).format();
            eventObj.endDateTime = moment(event.endDateTime).tz(userTimezone).format();
            eventObj.createdAt = moment(event.createdAt).tz(userTimezone).format();
            eventObj.updatedAt = moment(event.updatedAt).tz(userTimezone).format();
            
            // Convert update logs timestamps
            if (eventObj.updateLogs) {
                eventObj.updateLogs = eventObj.updateLogs.map(log => ({
                    ...log,
                    updatedAt: moment(log.updatedAt).tz(userTimezone).format()
                }));
            }
            
            return eventObj;
        });

        return res.status(200).json({
            success: true,
            message: "Events fetched successfully",
            data: eventsWithTimezone
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch events"
        });
    }
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const { timezone = 'UTC' } = req.query;

        const events = await Event.find({})
            .populate('profiles', 'name timezone')
            .sort({ startDateTime: 1 });

        // Convert events to specified timezone
        const eventsWithTimezone = events.map(event => {
            const eventObj = event.toObject();
            eventObj.startDateTime = moment(event.startDateTime).tz(timezone).format();
            eventObj.endDateTime = moment(event.endDateTime).tz(timezone).format();
            eventObj.createdAt = moment(event.createdAt).tz(timezone).format();
            eventObj.updatedAt = moment(event.updatedAt).tz(timezone).format();
            
            // Convert update logs timestamps
            if (eventObj.updateLogs) {
                eventObj.updateLogs = eventObj.updateLogs.map(log => ({
                    ...log,
                    updatedAt: moment(log.updatedAt).tz(timezone).format()
                }));
            }
            
            return eventObj;
        });

        return res.status(200).json({
            success: true,
            message: "All events fetched successfully",
            data: eventsWithTimezone
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch events"
        });
    }
};

// Update an event
exports.updateEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { title, profiles, timezone, startDateTime, endDateTime } = req.body;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Validate profiles if provided
        if (profiles) {
            const users = await User.find({ _id: { $in: profiles } });
            if (users.length !== profiles.length) {
                return res.status(400).json({
                    success: false,
                    message: "One or more profiles not found"
                });
            }
        }

        // Validate dates if provided
        if (startDateTime && endDateTime) {
            const startDate = new Date(startDateTime);
            const endDate = new Date(endDateTime);

            if (startDate >= endDate) {
                return res.status(400).json({
                    success: false,
                    message: "End date/time must be after start date/time"
                });
            }
        }

        // Update fields
        if (title) event.title = title;
        if (profiles) event.profiles = profiles;
        if (timezone) event.timezone = timezone;
        if (startDateTime) event.startDateTime = new Date(startDateTime);
        if (endDateTime) event.endDateTime = new Date(endDateTime);

        await event.save();

        const updatedEvent = await Event.findById(eventId).populate('profiles', 'name timezone');

        return res.status(200).json({
            success: true,
            message: "Event updated successfully",
            data: updatedEvent
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to update event"
        });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const { eventId } = req.params;

        const event = await Event.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete event"
        });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { timezone = 'UTC' } = req.query;

        const event = await Event.findById(eventId).populate('profiles', 'name timezone');
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Convert to specified timezone
        const eventObj = event.toObject();
        eventObj.startDateTime = moment(event.startDateTime).tz(timezone).format();
        eventObj.endDateTime = moment(event.endDateTime).tz(timezone).format();
        eventObj.createdAt = moment(event.createdAt).tz(timezone).format();
        eventObj.updatedAt = moment(event.updatedAt).tz(timezone).format();
        
        // Convert update logs timestamps
        if (eventObj.updateLogs) {
            eventObj.updateLogs = eventObj.updateLogs.map(log => ({
                ...log,
                updatedAt: moment(log.updatedAt).tz(timezone).format()
            }));
        }

        return res.status(200).json({
            success: true,
            message: "Event fetched successfully",
            data: eventObj
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch event"
        });
    }
};

// Get event update logs
exports.getEventLogs = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { timezone = 'UTC' } = req.query;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        // Convert log timestamps to specified timezone
        const logsWithTimezone = event.updateLogs.map(log => ({
            ...log.toObject(),
            updatedAt: moment(log.updatedAt).tz(timezone).format()
        }));

        return res.status(200).json({
            success: true,
            message: "Event logs fetched successfully",
            data: logsWithTimezone
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch event logs"
        });
    }
};
