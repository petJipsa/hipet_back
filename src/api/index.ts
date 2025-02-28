import Router from '@koa/router';
import multer from '@koa/multer';

const api = new Router();
const storage = multer.diskStorage({
  destination: async (req, file, cb) => { cb(null, './files') },
  filename: async (req, file, cb) => { await cb(null,`${Date.now()}-${encodeURIComponent(file.originalname)}`) }
});

const fileFilter = async (req, file, cb) => {
  let typeArray = file.mimetype.split('/');
  let fileType = typeArray[1];
  cb(null, true);
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

import { signUp, uploadImage, loadImage, writePost, loadMyProfile, loadProfile, changeProfile, getPost, updateViews, postLike,getLike } from './api.controller';

api.post('/auth', signUp);
api.get('/auth', loadMyProfile);
api.get('/auth/:uid', loadProfile);
api.put('/auth', changeProfile);
api.post('/media', upload.single('media'), uploadImage);
api.get('/media/:media', loadImage);
api.post('/post', writePost);
api.get('/post', getPost);
api.post('/view', updateViews);
api.post('/like', postLike)
api.get('/like', getLike);

export default api