var join            = require( 'path' ).join,
    fs              = require( 'fs' ),
    mkdirp          = require( 'mkdirp' ),
    multiparty      = require( 'multiparty' ),
    config          = require( '../config/app' ),
    String          = require( '../lib/string' );

exports.cors        = function ( req, res, next ) {
    res.header( 'Access-Control-Allow-Origin', '*' );
    res.header( 'Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS' );
    res.header( 'Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Lenght, X-Requested-With' );

    if ( req.method == 'OPTIONS' ) {
        res.send( 200 );
    } else {
        next();
    }
};

exports.move        = function ( file, from, to, cb ) {
    mkdirp( to, function ( err, dir ) {
        if ( err ) {
            return cb( err );
        }

        var path    = join( from, file ),
            dest    = join( to, file );
        fs.rename( path, dest, function ( err ) {
            if ( err ) {
                return cb( err );
            }

            cb( null );
        });
    });
};

exports.paginate    = function( Model, req, res, next ) {
    var filters     = req.param( 'filters' ),
        fields      = req.param( 'select' ),
        limit       = ( req.param( 'limit' ) ) ? req.param( 'limit' ) : config.page_size,
        page        = ( req.param( 'page' ) ) ? req.param( 'page' ) : 1,
        skip        = limit * ( page - 1 ),
        sort        = ( req.param( 'sort' ) ) ? req.param( 'sort' ) : 'creation_date',
        order       = ( req.param( 'order' ) ) ? req.param( 'order' ) : 'ASC',
        order_num   = ( order == 'DESC' ) ? -1 : 1,
        sort_object = {};

    if ( filters !== undefined && ( typeof filters !== 'object' ) ) {
        filters     = JSON.parse( filters );
    }

    sort_object[ sort ] = order_num;

    Model.find( filters, fields, {
        limit   : limit,
        skip    : skip,
        sort    : sort_object
    }, function ( err, docs ) {
        if ( err || !docs ) {
            var error       = new Error( 'Invalid request' );
            error.status    = 403;
            
            return next( error );
        }
        
        var result  = {
            page    : page,
            limit   : limit,
            data    : docs
        };

        Model.count( filters, function ( err, count ) {
            result.total    = count;
            res.json( result );
        });
    });
};

exports.params      = function ( req, res, next ) {
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

exports.upload      = function ( field, req, cb ) {
    var path        = join( config.uploads_tmp_path );

    mkdirp( path, function ( err, dir ) {
        if ( err ) {
            err         = new Error( 'UPLOAD_ERROR' );
            cb( err );
        }

        var file        = req.param( 'files' )[field][0],
            ext         = /(?:\.([^.]+))?$/.exec( file.path )[1],
            name        = String.random( 16, 'alnum' ),
            full_path   = join( path, name + '.' + ext );

        if ( !ext ) {
            var err     = new Error( 'UPLOAD_FILE_ERROR' );
            cb( err );
        }

        fs.rename( file.path, full_path, function ( err ) {
            if ( err ) {
                err     = new Error( 'UPLOAD_ERROR' );
                cb( err );
            }

            cb( null, {
                name    : name + '.' + ext,
                path    : full_path
            });
        });
    });
};