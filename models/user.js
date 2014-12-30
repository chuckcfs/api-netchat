var mongoose    = require( 'mongoose' ),
    bcrypt      = require( 'bcrypt' ),
    UserSchema  = new mongoose.Schema({
        access_level    : {
            type        : Number,
            required    : true
        },
        creation_date   : {
            type        : Date,
            required    : true,
            default     : Date.now
        },
        email           : {
            type        : String,
            required    : true,
            index       : {
                unique  : true
            }
        },
        first_name      : {
            type        : String,
            required    : true
        },
        last_name       : {
            type        : String,
            required    : true
        },
        pass            : {
            type        : String,
            required    : true
        }
    });

UserSchema.method( 'auth', function ( req, cb ) {
    var user    = this;
    bcrypt.compare( req.param( 'pass' ), user.pass, function( err, isMatch ) {
        if ( err ) {
            return cb( err );
        }

        if ( !isMatch ) {
            return cb( null, false );
        }

        cb( null, user );
    });
});

UserSchema.pre( 'save', function ( next ) {
    var user    = this;

    if ( !user.isModified( 'pass' ) ) {
        return next();
    }

    bcrypt.hash( user.pass, 10, function ( err, hash ) {
        if ( err ) {
            return next( err );
        }

        user.pass   = hash;
        next();
    });
});

module.exports  = mongoose.model( 'User', UserSchema );