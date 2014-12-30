var should  = require( 'should' ),
    assert  = require( 'assert' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( 'Session', function() {
    var session = "";

    describe( 'Login', function() {
        var user    = {
                email   : "carlos@bitslice.net",
                pass    : "admin"
            },
            wrong   = {
                email   : "jdoe@gmail.com",
                pass    : "123"
            },
            empty   = {
                email   : "",
                pass    : ""
            };

        it( 'should get a 401 error when trying invalid user credentials', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( wrong ) )
                .expect( 'Content-Type', /json/ )
                .expect( 401, done );
        });

        it( 'should get a 401 error when sending empty data to the server', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( empty ) )
                .expect( 'Content-Type', /json/ )
                .expect( 401, done )
        });

        it( 'should get a 200 success code and the session id when sending valid user data', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( user ) )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end( function( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'session' );
                    res.body.should.have.property( 'type' );

                    session = res.body.session;
                    done();
                });
        });
    });

    describe( 'Logout', function() {
        it( 'should terminate the previously started session', function ( done ) {
            request( server )
                .delete( '/sessions/' + session )
                .send( Auth.sign() )
                .expect( 'Content-Type', /json/ )
                .expect( 200, done );
        });

        it( 'should get a 401 error when trying to terminate an invalid session', function ( done ) {
            request( server )
                .delete( '/sessions/aiudgaudgalbkd' )
                .send( Auth.sign() )
                .expect( 401, done );
        });
    });
});