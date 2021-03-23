import Router from '@koa/router';
import multer from '@koa/multer';

const api = new Router();
const storage = multer.diskStorage({
  destination: async (req, file, cb) => { cb(null, './files') },
  filename: async (req, file, cb) => { cb(null,`${Date.now()}-${file.originalname}`) }
});
const upload = multer({ storage: storage });

/*import {signUp, loadProfile, changeProfile, userSecession, duplicateCheck, verification, login, logout, requestAccessToken, findPassword, loadImage} from './auth/auth.controller';

api.post('media/single', upload.single('profileImage'), changeProfile);
api.post('media/multiple', upload.array('profileImage', 5), changeProfile);
api.get('meadia/:mediapath', loadImage);

api.get('/auth', loadProfile);
api.put('/auth', upload.single('profileImage'), changeProfile);

api.post('/comment', comment);
api.get('/comment', loadComment);
api.put('/comment', updateComment);
api.delete('/comment', deleteComment);

//내 피드 보기 => 프로필 정보 일부, 올린 글 영상정보 및 post uuid
*/
export default api