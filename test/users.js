var should  = require( 'should' ),
    assert  = require( 'assert' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( 'Users', function() {
    var session = "",
        id      = "";

    describe( 'Create', function() {
        var admin       = {
                email   : 'carlos@bitslice.net',
                pass    : 'admin'
            },
            user        = {
                access_level    : 1,
                email           : 'jane.doe@gmail.com',
                name            : 'John Doe',
                pass            : 'pass'
            },
            invalid     = {
                email   : 'jdoe@gmail.com',
                pass    : 'pass'
            },
            credentials = {
                email   : 'jane.doe@gmail.com',
                pass    : 'pass'
            };

        it ( 'should get a 401 error when attempting to create an user with invalid parameters', function ( done ) {
            request( server )
                .post( '/users' )
                .send( Auth.sign( invalid ) )
                .expect( 401, done );
        });

        it ( 'should start a session to create an user in the system', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( admin ) )
                .expect( 'Content-Type', /json/ )
                .expect( 200 )
                .end( function( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    user.session    = session = res.body.session;
                    done();
                });
        });

        it ( 'should create a valid user in the system', function ( done ) {
            request( server )
                .post( '/users' )
                .send( Auth.sign( user ) )
                .expect( 200 )
                .end( function( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'access_level' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'email' );
                    res.body.should.have.property( 'name' );
                    res.body.should.have.property( 'pass' );

                    id  = res.body._id;
                    done();
                });
        });

        it ( 'should terminate the session started to create the test user', function ( done ) {
            request( server )
                .delete( '/sessions/' + session )
                .send( Auth.sign() )
                .expect( 'Content-Type', /json/ )
                .expect( 200, done );
        });

        it ( 'should start a session with the newly created user', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( credentials ) )
                .expect( 200 )
                .end( function( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    session = res.body.session;
                    done();
                });
        });
    });

    describe( 'Retrieve', function() {
        it ( 'should obtain a list of users', function ( done ) {
            request( server )
                .get( '/users' )
                .send( Auth.sign({ session : session }) )
                .expect( 200 )
                .end( function( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'page' );
                    res.body.should.have.property( 'limit' );
                    res.body.should.have.property( 'data' );
                    res.body.should.have.property( 'total' );

                    done();
                });
        });

        it ( 'should retrieve the information for the user previously created', function ( done ) {
            request( server )
                .get( '/users/' + id )
                .send( Auth.sign({ session : session }) )
                .expect( 200 )
                .end( function( err, res ) {
                    if( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'access_level' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'email' );
                    res.body.should.have.property( 'name' );
                    res.body.should.have.property( 'pass' );

                    done();
                });
        });
    });

    describe( 'Update', function() {
        var invalid = {
                npass   : 'newpass',
                rpass   : 'rpass'
            },
            valid   = {
                pass    : 'pass',
                npass   : 'newpass',
                rpass   : 'newpass'
            },
            mod     = {
                name    : 'Jane Doe'
            };

        it ( 'should get a 403 error when attempting to update a new password with invalid parameters', function ( done ) {
            invalid.session = session;
            request( server )
                .put( '/users/' + id + '/pass' )
                .send( Auth.sign( invalid ) )
                .expect( 403, done );
        });

        it ( 'should set a new password for the user', function ( done ) {
            valid.session   = session;
            request( server )
                .put( '/users/' + id + '/pass' )
                .send( Auth.sign( valid ) )
                .expect( 200, done );
        });

        it ( 'should get a 403 error when attempting to set a password and not specifying the correct current pass', function ( done ) {
            valid.session   = session;
            request( server )
                .put( '/users/' + id + '/pass' )
                .send( Auth.sign( valid ) )
                .expect( 403, done );
        });

        it ( 'should update the user name for the user previously created', function ( done ) {
            mod.session = session;
            request( server )
                .put( '/users/' + id )
                .send( Auth.sign( mod ) )
                .expect( 200 )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    assert.equal( 'Jane Doe', res.body.name );

                    done();
                });
        });
    });

    describe( 'Delete', function() {
        it ( 'should remove the previously created user', function ( done ) {
            request( server )
                .delete( '/users/' + id )
                .send( Auth.sign({ session : session }) )
                .expect( 200, done );
        });

        it ( 'should terminate the previously created session for testing purposes', function ( done ) {
            request( server )
                .delete( '/sessions/' + session )
                .send( Auth.sign() )
                .expect( 200, done );
        });
    });
});