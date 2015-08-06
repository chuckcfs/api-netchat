module.exports  = {
    'application_id'        : '55c2ee3a8919aede26e8cc35',
    'application_secret'    : 'V3T8jKlP7LDohOAkPBBDXhqZ3vKYVSa3',
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