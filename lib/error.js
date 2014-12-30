exports.notFound    = function ( req, res, next ) {
    var err     = new Error( 'Invalid resource specified' );
    err.status  = 404;
    next( err );
};

exports.handler     = function ( err, req, res, next ) {
    res.status( err.status || 500 );

    var response        = {
        message         : err.message
    };

    if ( res.app.get( 'env' ) == 'development' ) {
        response.error  = err;
    }

    res.json( response );
};