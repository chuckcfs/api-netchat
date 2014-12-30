var should  = require( 'should' ),
    assert  = require( 'assert' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( "REST API Server", function() {

    it ( 'should return a 401 error when no resource is specified and no session is provided', function ( done ) {
        request( server )
            .get( '/' )
            .send( Auth.sign() )
            .expect( 'Content-type', /json/ )
            .expect( 401, done );
    });
});