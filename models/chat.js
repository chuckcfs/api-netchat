var mongoose    = require( 'mongoose' ),
    ChatSchema  = mongoose.Schema({
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
        },
        last_message    : {
            type        : Date,
            required    : true,
            default     : Date.now
        }
    });

module.exports  = mongoose.model( 'Chat', ChatSchema );