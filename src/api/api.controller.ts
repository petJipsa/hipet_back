import { errorCode } from '../lib/errorcode';
import { userinit } from '../lib/process';
import { verify } from '../lib/firebase';
import { getConnection } from "typeorm";
import { User } from '../entity/User';
import { Survey } from '../entity/Survey';
import { Media } from '../entity/Media';
import { Post } from '../entity/Post';
import send from 'koa-send';
import short from 'short-uuid';
import dotenv from 'dotenv';
dotenv.config();

const translator = short(short.constants.flickrBase58, { consistentLength: false });

export const signUp = (async (ctx) => { 
  console.log("sadsd");
  
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const { survey } = ctx.request.body;
  let body : object, status : number;
  
  if (firebaseToken !== 'error') {
    const user = await getConnection()
    .createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.uid = :uid", { uid: firebaseToken[0] })
    .getOne();

    if (user === undefined) {
      let name = await userinit();
      
      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({ uid: firebaseToken[0], profile: '0', name: name, provider: firebaseToken[1] })// 아직 프로필 사진 뭐뭐있는지 않나옴
      .execute();
      await getConnection()
      .createQueryBuilder()
      .insert()
      .into(Survey)
      .values({ userUid: firebaseToken[0], answer: survey })
      .execute();

      status = 201;
      body = {};
    }else{
      status = 403;
      body = await errorCode(303);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const loadMyProfile = (async (ctx) => { 
  const firebaseToken = await verify(ctx.header.firebasetoken);
  let body : object, status : number;
  
  if (firebaseToken !== 'error') {
    const user = await getConnection()
    .createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.uid = :uid", { uid: firebaseToken[0] })
    .getOne();

    if (user !== undefined) {
      status = 200;
      body = {"name" : user.name, "uid" : user.uid, "profileImg" : user.profile};
    }else{
      status = 403;
      body = await errorCode(108);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const loadProfile = (async (ctx) => { 
  const { uid } = ctx.params;
  let body : object, status : number;
  
  const user = await getConnection()
  .createQueryBuilder()
  .select("user")
  .from(User, "user")
  .where("user.uid = :uid", { uid: uid })
  .getOne();

  if (user !== undefined) {
    status = 200;
    body = {
    "name" : user.name,
    "follower" : user.follower,
    "following" : user.following,
    "profileImg" : user.profile};
  }else{
    status = 403;
    body = await errorCode(108);
  }

  ctx.status = status;
  ctx.body = body;
});

export const changeProfile = (async (ctx) => {
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const profileImage = ctx.request.body.profileImg != undefined ? ctx.request.body.profileImg : undefined;
  const name = ctx.request.body.name != undefined ? ctx.request.body.name : undefined;
  let body : object, status : number, option : object;

  if (firebaseToken !== 'error') {
    const user = await getConnection()
    .createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.uid = :uid", { uid: firebaseToken[0] })
    .getOne();

    if (user !== undefined) {
      
      if (name !== undefined && profileImage === undefined) {
        option = { name: name };
      }else if (name === undefined && profileImage !== undefined){
        option = { profile: profileImage };
      }else{
        option = { name: name, profile: profileImage };
      }

      await getConnection()
      .createQueryBuilder()
      .update(User)
      .set(option)
      .where("user.uid = :uid", { uid: firebaseToken[0] })
      .execute();

      status = 201;
      body = {};
    }else{
      status = 403;
      body = await errorCode(108);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const uploadImage = (async (ctx) => { 
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const fileName = ctx.request.file != undefined ? ctx.request.file.filename : undefined;
  let body : object, status : number;

  if (fileName !== undefined) {
    if (firebaseToken !== 'error') {
      const user = await getConnection()
      .createQueryBuilder()
      .select("user")
      .from(User, "user")
      .where("user.uid = :uid", { uid: firebaseToken[0] })
      .getOne();

      if (user !== undefined) {
        const uid = await translator.new();
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Media)
        .values({ 
          uid : uid,
          userUid: firebaseToken[0], 
          path: fileName })
        .execute();

        status = 201;
        body = {"uid" : uid};
      }else{
        status = 403;
        body = await errorCode(303);
      }
    }else{
      status = 412;
      body = await errorCode(302);
    }
  }else{
    status = 403;
    body = await errorCode(401, '파일 또는 파일 확장자 오류');
  }

  ctx.status = status;
  ctx.body = body;
});

export const loadImage = (async (ctx) => { 
  const { media } = ctx.params;
  let body : object, status : number;
  
  const path = await getConnection()
  .createQueryBuilder()
  .select("media")
  .from(Media, "media")
  .where("media.uid = :uid", { uid: media })
  .orWhere("media.path = :path", { path: media })
  .getOne();

  try { await send(ctx, path.path, { root: './files/' }); }
  catch(err){
    ctx.status = 404;
    ctx.body = await errorCode(501);
  }
});

export const writePost = (async (ctx) => {
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const { description, mediaName } = ctx.request.body;
  let body : object, status : number;

  if(firebaseToken !== 'error'){
    const post = await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values({ userUid: firebaseToken[0], description: description, mediaName: mediaName })
    .execute();

    status = 201;
    body = {};
  } else {
    status = 401;
    body = await errorCode(401);
  }
  ctx.status = status;
  ctx.body = body;
});




/*


export const comment = (async (ctx) => {
  const { content } = ctx.request.body;
  const { postid } = ctx.request.header;
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,postRows,commentRows, groupId, commentClass, commentOrder,check;


  if(accesstoken[0]){
    try{
      postRows = await Post.findOne({_id: postid}).exec();
      if (postRows != null) {
        
        if (commentid != undefined) { 
          commentRows = await Comment.findOne({groupId: commentid}).sort({ date: -1 }).exec(); 
          if (commentRows != null) {
            groupId = commentRows['groupId'];
            commentClass = commentRows['class'];
            commentOrder = commentRows['order']+1;
          }else{
            commentRows = await Comment.findOne({_id: commentid}).exec(); 
            groupId = commentid;
            commentClass = commentRows['class']+1;
            commentOrder = 1;
          }
          
        }else{
          commentRows = await Comment.findOne({postId: postid, class: 1}).sort({ date: -1 }).exec(); 
          groupId = 'root';
          commentClass = 1;
          if (commentRows != null) { commentOrder = commentRows['order']+1; }
          else{ commentOrder = 1; }
        }
      
        check = await addComment(postid, groupId, content, accesstoken[1], commentClass, commentOrder);
        if (check == false) { throw new Error("형식 에러"); }

        status = 201;
        body = {};
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401);
     }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const loadComment = (async (ctx) => {
  const { postid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows,commentRows;


  if(accesstoken[0]){
    try{
      rows = await Post.findOne({_id: postid}).exec();
      if (rows != null) {
        commentRows = await Comment.find({postId: postid}).sort({ class: 1 }).exec();
        status = 201;
        body = {comments: commentRows};
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401);
     }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const updateComment = (async (ctx) => {
  const { content } = ctx.request.body;
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;


  if(accesstoken[0]){
    try{
      rows = await Comment.findOne({_id: commentid}).exec();
      if (rows != null && rows['userId'] == accesstoken[1]) { 
        await Comment.updateOne({_id: commentid, content: content}).exec();
        await log('L202',`댓글변경-${commentid}`);
        status = 201;
        body = {};
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401);
     }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const deleteComment = (async (ctx) => {
  const { commentid } = ctx.request.header;
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;


  if(accesstoken[0]){
    try{
      rows = await Comment.findOne({_id: commentid}).exec();
      if (rows != null && rows['userId'] == accesstoken[1]) { 
        await Comment.deleteOne({_id: commentid}).exec();
        await log('L203',`댓글 삭제-${commentid}`);
        status = 201;
        body = {};
      }else{
        status = 403;
        body = await errorCode(108);
      }
    }catch(err){ 
      status = 403;
      body = await errorCode(401);
     }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

*/