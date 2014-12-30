var multiparty  = require( 'multiparty' ),
    config      = require( '../config/app' );

exports.cors    = function ( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Lenght, X-Requested-With' );

    if ( req.method == 'OPTIONS' ) {
        res.send( 200 );
    } else {
        next();
    }
};

exports.params  = function ( req, res, next ) {
    var type    = req.get( 'Content-Type' ),
        form    = new multiparty.Form({
            uploadDir   : config.uploads_tmp_path
        }),
        params  = {};
    
    if ( /multipart\/form-data/.test( type ) ) {
        form.parse( req, function( err, fields, files ) {
            for ( var key in fields ) {
                params[key] = fields[key][0];
            }
            
            params.files    = files;
            
            req.body        = params;
            next();
        });
    } else {
        next();
    }
};