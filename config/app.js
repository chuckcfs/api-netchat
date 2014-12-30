var env         = process.env.ENV || 'development',
    config      = null;

if ( env == 'development' ) {
    config      = require( './development/app' );
} else if ( env == 'production' ) {
    config      = require( './production/app' );
}

module.exports  = config;