module.exports  = {
    'application_id'        : '54a1fc47c9187f743a56af74',
    'application_secret'    : 'mlsbDULAshGBfxvgT5Ji9eDoZpbxSDBD',
    'encryption_key'        : 'bQy&eq3ZGEXR2Cs7WK^8oyA@Gm9zHbAY',
    'page_size'             : 20,
    'request_lifespan'      : 100000,
    'registration_open'     : true,
    's3_uploads'            : true,
    's3_namespace'          : 'netchat',
    's3_location'           : 'us-west-1',
    's3_url'                : 'http://netchat.s3-us-west-1.amazonaws.com/',
    'public_path'           : '../public',
    'uploads_path'          : './public/uploads',
    'uploads_tmp_path'      : './public/tmp',
    'user_types'            : [
        'superadmin',
        'admin',
        'developer',
        'registered'
    ]
};