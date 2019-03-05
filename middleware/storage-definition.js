const multer = require('multer');

exports.defineStorage = ( path = 'uploads/',
                          definedSize = 5242880   // equals to 5MB
) => {

    const serverStorage = multer.diskStorage({
        destination: ( req, file, callback ) => {
            callback( null, path );
        },
        filename: ( req, file, callback ) => {
            if ( req.userData.userId ) {
                const fileName =  req.userData.userId + file.originalname.split('.')[1];
                return callback( null, fileName );
            } else {
                const defaultFileName = new Date().getTime() + '_' + file.originalname;
                return callback( null, defaultFileName );
            }
        },
    });

    const ImageFilter = ( req, file, callback ) => {
        if ( file.originalname.match(/\.(jpg|jpeg|png|gif)$/) ) {
            //save file
            callback( null, true );
        } else {
            //reject file
            callback( new Error('Image format is not supported.'), false );
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