var mongoose        = require( 'mongoose' ),
    MessageSchema   = mongoose.Schema({
        attachment      : {
            type        : {
                name    : {
                    type        : String,
                    required    : true
                },
                path    : {
                    type        : String,
                    required    : true
                }
            },
            required    : false
        },
        content         : {
            type        : String,
            required    : true
        },
        creation_date   : {
            type        : Date,
            required    : true,
            default     : Date.now
        },
        from            : {
            type        : {
                _id     : {
                    type        : String,
                    required    : true
                },
                name    : {
                    type        : String,
                    required    : true
                }
            },
            required    : true
        },
        to              : {
            type        : {
                _id     : {
                    type        : String,
                    required    : true
                },
                name    : {
                    type        : String,
                    required    : true
                }
            },
            required    : true
        }
    });

module.exports      = mongoose.model( 'Message', MessageSchema );