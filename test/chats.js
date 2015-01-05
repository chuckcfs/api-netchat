var should  = require( 'should' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( 'Chats', function () {
    var id      = "",
        session = "";

    describe( 'Create', function () {
        var user    = {
                email   : 'carlos@bitslice.net',
                pass    : 'admin'
            },
            chat    = {
                from        : {
                    _id     : '141414141',
                    name    : 'John Doe'
                },
                to          : {
                    _id     : '152521514',
                    name    : 'Carlos Cessa'
                }
            };

        it ( 'should get a 401 error when attempting to create a chat with an unauthorized user', function ( done ) {
            request( server )
                .post( '/chats' )
                .send( Auth.sign() )
                .expect( 401, done );
        });

        it ( 'should start a session to create a chat object in the system', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( user ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    session     = chat.session = res.body.session;

                    done();
                });
        });

        it ( 'should create a chat object in the system', function ( done ) {
            request( server )
                .post( '/chats' )
                .send( Auth.sign( chat ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'from' );
                    res.body.should.have.property( 'last_message' );
                    res.body.should.have.property( 'to' );
                    id  = res.body._id;

                    done();
                });
        });
    });

    describe( 'Retrieve', function () {
        it ( 'should retrieve a list of chats from the system', function ( done ) {
            request( server )
                .get( '/chats' )
                .send( Auth.sign({ session : session }) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'data' );
                    res.body.should.have.property( 'limit' );
                    res.body.should.have.property( 'page' );
                    res.body.should.have.property( 'total' );

                    done();
                });
        });
    });

    describe( 'Delete', function () {
        it ( 'should remove the chat object created for testing purposes', function ( done ) {
            request( server )
                .delete( '/chats/' + id )
                .send( Auth.sign({ session : session }) )
                .expect( 200, done );
        });

        it ( 'should terminate the session started for testing purposes', function ( done ) {
            request( server )
                .delete( '/sessions/' + session )
                .send( Auth.sign() )
                .expect( 200, done );
        });
    });
});