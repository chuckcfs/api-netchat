var assert  = require( 'assert' ),
    fs      = require( 'fs' ),
    should  = require( 'should' ),
    request = require( 'supertest' ),
    server  = require( '../server' ),
    Auth    = require( './lib/auth' );

describe( 'NetChat', function () {
    var attach      = "",
        attachment  = "",
        chat_id     = "",
        message_id  = "",
        sender_id   = "",
        receiver_id = "",
        s_session   = "",
        r_session   = "",
        chat        = {
            from        : {},
            to          : {}
        },
        message     = {
            content : 'Hello world!',
            from    : {},
            to      : {}
        },
        sender      = {
            access_level    : 1,
            email           : 'jdoe@netchat.com',
            name            : 'Jane Doe',
            pass            : 'admin'
        },
        receiver    = {
            access_level    : 1,
            email           : 'john.doe@netchat.com',
            name            : 'John Doe',
            pass            : 'admin'
        };

    it ( 'should get a 401 error when attempting a request on an unauthorized connection', function ( done ) {
        request( server )
            .post( '/messages' )
            .send( Auth.sign() )
            .expect( 401, done );
    });

    describe( 'Users Creation', function () {
        it ( 'should create a sender user for the application testing', function ( done ) {
            request( server )
                .post( '/users' )
                .send( Auth.sign( sender ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'email' );
                    res.body.should.have.property( 'name' );

                    sender_id           = message.from._id = chat.from._id = res.body._id;
                    message.from.name   = chat.from.name = res.body.name;

                    done();
                });
        });

        it ( 'should create a receiver user for the application testing', function ( done ) {
            request( server )
                .post( '/users' )
                .send( Auth.sign( receiver ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'email' );
                    res.body.should.have.property( 'name' );

                    receiver_id         = message.to._id = chat.to._id = res.body._id;
                    message.to.name     = chat.to.name = res.body.name;

                    done();
                });
        });
    });

    describe( 'Sessions Start', function () {
        it ( 'should get a 401 error when attempting to start a session for an unauthorized user', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign({ email : 'jdoe@netchat.com', pass : 'invalid' }) )
                .expect( 401, done );
        });

        it( 'should get a 401 error when sending empty data to the server', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign({ email : "", pass : "" }) )
                .expect( 'Content-Type', /json/ )
                .expect( 401, done )
        });

        it ( 'should create a session for the sender user', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( sender ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'session' );
                    res.body.should.have.property( 'type' );

                    s_session   = res.body.session;

                    done();
                });
        });

        it ( 'should create a session for the receiver user', function ( done ) {
            request( server )
                .post( '/sessions' )
                .send( Auth.sign( receiver ) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'session' );
                    res.body.should.have.property( 'type' );

                    r_session   = res.body.session;

                    done();
                });
        });
    });

    describe( 'Users Retrieve', function () {
        it ( 'should obtain a list of users', function ( done ) {
            request( server )
                .get( '/users' )
                .send( Auth.sign({ session : r_session }) )
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
                .get( '/users/' + receiver_id )
                .send( Auth.sign({ session : r_session }) )
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

    describe( 'Users Update', function () {
        var invalid = {
                npass   : 'newpass',
                rpass   : 'rpass'
            },
            valid   = {
                pass    : 'admin',
                npass   : 'newpass',
                rpass   : 'newpass'
            },
            mod     = {
                name    : 'Jane Doe'
            };

        it ( 'should get a 403 error when attempting to update a new password with invalid parameters', function ( done ) {
            invalid.session = r_session;
            request( server )
                .put( '/users/' + receiver_id + '/pass' )
                .send( Auth.sign( invalid ) )
                .expect( 403, done );
        });

        it ( 'should set a new password for the user', function ( done ) {
            valid.session   = r_session;
            request( server )
                .put( '/users/' + receiver_id + '/pass' )
                .send( Auth.sign( valid ) )
                .expect( 200, done );
        });

        it ( 'should get a 403 error when attempting to set a password and not specifying the correct current pass', function ( done ) {
            valid.session   = r_session;
            request( server )
                .put( '/users/' + receiver_id + '/pass' )
                .send( Auth.sign( valid ) )
                .expect( 403, done );
        });

        it ( 'should update the user name for the user previously created', function ( done ) {
            mod.session = r_session;
            request( server )
                .put( '/users/' + receiver_id )
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

    describe( 'Chat Creation', function () {
        it ( 'should get a 401 error when attempting to create a chat with an unauthorized user', function ( done ) {
            request( server )
                .post( '/chats' )
                .send( Auth.sign() )
                .expect( 401, done );
        });

        it ( 'should create a chat for testing in the system', function ( done ) {
            chat.session    = s_session;
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
    });

    describe( 'Chat Retrieval', function () {
        it ( 'should retrieve a list of chats from the system', function ( done ) {
            request( server )
                .get( '/chats' )
                .send( Auth.sign({ session : s_session }) )
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

        it ( 'should retrieve a single chat object from the system', function ( done ) {
            request( server )
                .get( '/chats/' + chat_id )
                .send( Auth.sign({ session : s_session }) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( '_id' );
                    res.body.should.have.property( 'creation_date' );
                    res.body.should.have.property( 'from' );
                    res.body.should.have.property( 'last_message' );
                    res.body.should.have.property( 'to' );

                    done();
                });
        });
    });

    describe( 'Message Creation', function () {
        it ( 'should get a 401 error when trying to create a message from an unauthorized user', function ( done ) {
            request( server )
                .post( '/messages' )
                .send( Auth.sign( message ) )
                .expect( 401, done );
        });

        it ( 'should send a message in the system', function ( done ) {
            message.session = s_session;
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

                    message_id  = res.body._id;

                    done();
                });
        });

        it ( 'should upload an attachment to the system to send as part of a message', function ( done ) {
            this.timeout( 10000 );
            var auth    = Auth.sign();
            request( server )
                .post( '/messages/file' )
                .field( 'consumer', auth.consumer )
                .field( 'timestamp', auth.timestamp )
                .field( 'session', s_session )
                .field( 'signature', auth.signature )
                .attach( 'file', 'test/files/image.png' )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    res.body.should.have.property( 'file' );
                    res.body.file.should.have.property( 'name' );
                    res.body.file.should.have.property( 'path' );
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

                    attach  = res.body._id;

                    done();
                });
        });
    });

    describe( 'Message Retrieval', function () {
        it ( 'should retrieve a list of messages from the system', function ( done ) {
            request( server )
                .get( '/messages' )
                .send( Auth.sign({ session : s_session }) )
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

    describe( 'Message Removal', function () {
        it ( 'should remove the message created for testing purposes', function ( done ) {
            request( server )
                .delete( '/messages/' + message_id )
                .send( Auth.sign({ session : s_session }) )
                .expect( 200, done );
        });

        it ( 'should remove the message with attachment created', function ( done ) {
            this.timeout( 10000 );
            request( server )
                .delete( '/messages/' + attach )
                .send( Auth.sign({ session : s_session }) )
                .end( function ( err, res ) {
                    if ( err ) {
                        throw err;
                    }

                    assert.equal( false, fs.existsSync( './' + attachment.path ) );

                    done();
                });
        });
    });

    describe( 'Chat Removal', function () {
        it ( 'should remove the chat created for testing purposes', function ( done ) {
            request( server )
                .delete( '/chats/' + chat_id )
                .send( Auth.sign({ session : s_session }) )
                .expect( 200, done );
        });
    });

    describe( 'Users Removal', function () {
        it ( 'should get a 403 error when trying to remove an user from another unauthorized user session', function ( done ) {
            request( server )
                .delete( '/users/' + receiver_id )
                .send( Auth.sign({ session : s_session }) )
                .expect( 403, done );
        });

        it ( 'should remove the sender user created for application testing', function ( done ) {
            request( server )
                .delete( '/users/' + sender_id )
                .send( Auth.sign({ session : s_session }) )
                .expect( 200, done );
        });

        it ( 'should remove the receiver user created for application testing', function ( done ) {
            request( server )
                .delete( '/users/' + receiver_id )
                .send( Auth.sign({ session : r_session }) )
                .expect( 200, done );
        });
    });

    describe( 'Sessions Ending', function () {
        it ( 'should terminate the sender user session', function ( done ) {
            request( server )
                .delete( '/sessions/' + s_session )
                .send( Auth.sign() )
                .expect( 200, done );
        });

        it ( 'should terminate the receiver user session', function ( done ) {
            request( server )
                .delete( '/sessions/' + r_session )
                .send( Auth.sign() )
                .expect( 200, done );
        });

        it( 'should get a 401 error when trying to terminate an invalid session', function ( done ) {
            request( server )
                .delete( '/sessions/aiudgaudgalbkd' )
                .send( Auth.sign() )
                .expect( 401, done );
        });

        it( 'should get a 401 error when trying to terminate an empty session', function ( done ) {
            request( server )
                .delete( '/sessions' )
                .send( Auth.sign() )
                .expect( 401, done );
        });
    });
});