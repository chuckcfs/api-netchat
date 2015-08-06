var mongoose        = require( 'mongoose' ),
    Encrypt         = require( '../lib/encrypt' ),
    StringHelper    = require( '../lib/string' ),
    AppSchema       = new mongoose.Schema({
        creation_date   : {
            type        : Date,
            required    : true,
            default     : Date.now
        },
        description     : {
            type        : String,
            required    : true
        },
        name            : {
            type        : String,
            required    : true,
            index       : {
                unique  : true
            }
        },
        permissions     : {
            type        : Object,
            required    : true
        },
        secret          : {
            type        : String,
            required    : true
        }
    });

AppSchema.pre( 'validate', function( next ) {
    if ( !this.secret ) {
        this.secret = Encrypt.encode( StringHelper.random( 32, 'alnum' ) );
    }
    next();
});

module.exports  = mongoose.model( 'Application', AppSchema );