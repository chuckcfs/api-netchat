var fs      = require( 'fs' ),
    should  = require( 'should' ),
    assert  = require( 'assert' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( 'Messages', function () {
    var attach      = "",
        attachment  = "",
        session     = "",
        id          = "",
        chat_id     = "";

    describe( 'Create', function () {
        var user    = {
                email   : 'carlos@bitslice.net',
                pass    : 'admin'
            },
            chat    = {
                from        : {
                    _id     : '1415425114',
                    name    : 'Carlos Cessa'
                },
                to          : {
                    _id     : '1414141',
                    name    : 'John Doe'
                }
            },
            message = {
                content : 'Hello world!',
                from    : {
                    _id     : '1415425114',
                    name    : 'Carlos Cessa'
                },
                to      : {
                    _id     : '1414141',
                    name    : 'John Doe'
                }
            };

        it ( 'should get a 401 error when attempting to create a message with an unauthorized user', function ( done ) {
            request( server )
                .post( '/messages' )
                .send( Auth.sign( message ) )
                .expect( 401, done );
        });

        it ( 'should start an user session to send messages in the system', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( user ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    session = message.session = chat.session = res.body.session;

                    done();
                });
        });

        it ( 'should create a chat in the system for the messages to attach to', function ( done ) {
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
                    chat_id = message.chat = res.body._id;

                    done();
                });
        });

        it ( 'should create a message in the system', function ( done ) {
            request( server )
                .post( '/messages' )
                .send( Auth.sign( message ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'content' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'from' );
                    res.body.should.have.property( 'to' );

                    id  = res.body._id;

                    done();
                });
        });

        it ( 'should upload an attachment to the system to send as part of a message', function ( done ) {
            var auth    = Auth.sign();
            request( server )
                .post( '/messages/file' )
                .field( 'consumer', auth.consumer )
                .field( 'timestamp', auth.timestamp )
                .field( 'session', session )
                .field( 'signature', auth.signature )
                .attach( 'file', 'test/files/image.png' )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'file' );
                    res.body.file.should.have.property( 'name' );
                    res.body.file.should.have.property( 'path' );
                    assert.equal( true, fs.existsSync( './' + res.body.file.path ) );
                    message.attachment  = attachment = res.body.file;

                    done();
                });
        });

        it ( 'should create a message with a previously uploaded attachment', function ( done ) {
            request( server )
                .post( '/messages' )
                .send( Auth.sign( message ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'attachment' );
                    res.body.should.have.property( 'content' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'from' );
                    res.body.should.have.property( 'to' );
                    res.body.attachment.should.have.property( 'name' );
                    res.body.attachment.should.have.property( 'path' );
                    assert.equal( true, fs.existsSync( './' + res.body.attachment.path ) );

                    attach  = res.body._id;

                    done();
                });
        });
    });

    describe( 'Retrieve', function () {
        it ( 'should retrieve a list of messages from the system', function ( done ) {
            request( server )
                .get( '/messages' )
                .send( Auth.sign({ session : session }) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'data' );
                    res.body.should.have.property( 'limit' );
                    res.body.should.have.property( 'page' );
                    res.body.should.have.property( 'total' );
                    assert.equal( true, Array.isArray( res.body.data ) );

                    done();
                });
        });
    });

    describe( 'Delete', function () {
        it ( 'should remove the message created for testing purposes', function ( done ) {
            request( server )
                .delete( '/messages/' + id )
                .send( Auth.sign({ session : session }) )
                .expect( 200, done );
        });

        it ( 'should remove the message with attachment created', function ( done ) {
            request( server )
                .delete( '/messages/' + attach )
                .send( Auth.sign({ session : session }) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    assert.equal( false, fs.existsSync( './' + attachment.path ) );

                    done();
                });
        });

        it ( 'should remove the chat created for testing purposes', function ( done ) {
            request( server )
                .delete( '/chats/' + chat_id )
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