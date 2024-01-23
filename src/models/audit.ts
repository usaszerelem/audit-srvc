const mongoose = require('mongoose');
const Joi = require('joi-oid');

// ----------------------------------------------------------------
// Field min/max length

const ID_LENGTH = 25;
const SOURCE_LENGTH_MIN = 5;
const SOURCE_LENGTH_MAX = 30;
const METHOD_LENGTH_MIN = 3;
const METHOD_LENGTH_MAX = 7;
const AUDIT_DATA_MAX_LENGTH = 4000;

// ----------------------------------------------------------------
// timeStamp - timestamp of when the event was created in Epoch format
// userId - User's ID associated with this event
// source - Module name that this event was triggered in
// method - RESTful method call that triggered the event
// data - Data associated with this event.

const userSchema = new mongoose.Schema(
    {
        timeStamp: {
            type: Date,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        source: {
            type: String,
            required: true,
        },
        method: {
            type: String,
            required: true,
        },
        data: {
            type: String,
            required: true,
        },
    },
    { timestamps: true, versionKey: false }
);

export const Audit = mongoose.model('audit', userSchema);

// ---------------------------------------------------------------------------
// Validation of the user object.
// ---------------------------------------------------------------------------

export function validateAudit(audit: typeof Audit) {
    const schema = Joi.object({
        _id: Joi.objectId(),
        timeStamp: Joi.date(),
        userId: Joi.string().max(ID_LENGTH).required(),
        source: Joi.string().min(SOURCE_LENGTH_MIN).max(SOURCE_LENGTH_MAX).required(),
        method: Joi.string().min(METHOD_LENGTH_MIN).max(METHOD_LENGTH_MAX).required(),
        data: Joi.string().min(0).max(AUDIT_DATA_MAX_LENGTH),
    }).options({ allowUnknown: false });

    return schema.validate(audit);
}
