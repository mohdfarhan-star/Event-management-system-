const mongoose = require('mongoose');

// Schema for event update logs
const updateLogSchema = new mongoose.Schema({
    field: {
        type: String,
        required: true,
    },
    previousValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    newValue: {
        type: mongoose.Schema.Types.Mixed,
        required: true,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    updatedBy: {
        type: String,
        default: 'System',
    }
});

const eventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    profiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true,
    }],
    timezone: {
        type: String,
        default: "UTC",
        required: true,
    },
    startDateTime: {
        type: Date,
        required: true,
    },
    endDateTime: {
        type: Date,
        required: true,
    },
    updateLogs: [updateLogSchema],
}, {
    timestamps: true
});

// Pre-save middleware to track changes
eventSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        const modifiedFields = this.modifiedPaths();
        const excludeFields = ['updateLogs', 'updatedAt'];
        
        modifiedFields.forEach(field => {
            if (!excludeFields.includes(field)) {
                const previousValue = this._original ? this._original[field] : null;
                const newValue = this[field];
                
                if (previousValue !== newValue) {
                    this.updateLogs.push({
                        field: field,
                        previousValue: previousValue,
                        newValue: newValue,
                        updatedAt: new Date(),
                    });
                }
            }
        });
    }
    next();
});

// Store original document for comparison
eventSchema.post('init', function() {
    this._original = this.toObject();
});

module.exports = mongoose.model("Event", eventSchema);
