var mongoose        = require( 'mongoose' ),
    SessionSchema   = new mongoose.Schema({
        access_level    : {
            type        : Number,
            required    : true
        },
        ip_address      : {
            type        : String,
            required    : true
        },
        last_activity   : {
            type        : Date,
            required    : true,
            default     : Date.now
        },
        timestamp       : {
            type        : Date,
            required    : true,
            default     : Date.now
        },
        user_id         : {
            type        : String,
            required    : true
        }
    });

module.exports      = mongoose.model( 'Session', SessionSchema );