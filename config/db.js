var env         = process.env.ENV || 'development',
    config      = null;

if ( env == 'development' ) {
    config      = require( './development/db' );
} else if ( env == 'production' ) {
    config      = require( './production/db' );
}

exports.get     = function() {
    return "mongodb://" + config.user + ":" + config.pass + "@" + config.host + ":" + config.port + "/" + config.name;
};