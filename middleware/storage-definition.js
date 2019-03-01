const multer = require('multer');

exports.defineStorage = ( path = './uploads/',
                          pref = (new Date().toISOString() + '_'),
                          fileTypes = ['image/jpeg', 'image/png'],
                          definedSize = 5242880   // equals to 5MB
) => {

    const serverStorage = multer.diskStorage({
        destination: ( req, file, callback ) => {
            callback( null, path );
        },
        filename: ( req, file, callback ) => {
            const prefix =  `${pref}_` + file.originalname;
            return callback( null, prefix );
        },
    });

    const ImageFilter = ( req, file, callback ) => {
        if ( fileTypes.includes(file.minetype) ) {
            //save file
            callback( null, true );
        } else {
            //reject file
            callback( new Error('Immage format is not supported.'), false );
        }
    };

    return multer({  //defines destination and properties where and how to upload
        storage: serverStorage,
        limit: {
            fileSize: definedSize  //sets the max file size limit
        },
        fileFilter : ImageFilter
    });

};