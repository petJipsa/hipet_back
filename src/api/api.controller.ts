import { errorCode } from '../lib/errorcode';
import { userinit } from '../lib/process';
import { verify } from '../lib/firebase';
import { getConnection } from "typeorm";
import { User } from '../entity/User';
import { Survey } from '../entity/Survey';
import { Media } from '../entity/Media';
import { Post } from '../entity/Post';
import { Like } from '../entity/Like';
import send from 'koa-send';
import short from 'short-uuid';
import dotenv from 'dotenv';
dotenv.config();

const translator = short(short.constants.flickrBase58, { consistentLength: false });

export const signUp = (async (ctx) => { 
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
  let array= "";

  if(firebaseToken !== 'error'){

    for await ( let tmp of mediaName ){
      array += tmp + ",";
    }

    await getConnection()
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values({ userUid: firebaseToken[0], description: description, mediaName: array })
    .execute();

    status = 201;
    body = {};
  } else {
    status = 412;
    body = await errorCode(302);
  }
  ctx.status = status;
  ctx.body = body;
});

export const getPost = (async (ctx) => {
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const userUid = ctx.header.user != undefined ? ctx.header.user : undefined;
  let body : object, status : number, post : any;

  if (firebaseToken !== 'error') {
    const user = await getConnection()
    .createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.uid = :uid", { uid: firebaseToken[0] })
    .getOne();

    if (user !== undefined) {
      if (userUid !== undefined) {
        post = await getConnection()
        .createQueryBuilder()
        .select(["post.userUid", "post.like", "post.view", "post.description", "post.mediaName", "post.date"])
        .from(Post, "post")
        .where("post.userUid = :uid", { uid: userUid })
        .getMany();
      }else{
        post = await getConnection()
        .createQueryBuilder()
        .select(["post.userUid", "post.like", "post.view", "post.description", "post.mediaName", "post.date"])
        .from(Post, "post")
        .orderBy("RAND()")
        .getOne();
      }
      
      status = 200;
      body = post;
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

export const updateViews = (async (ctx) => {
  const { postId } = ctx.request.body;
  let body : object, status : number;

  const views = await getConnection()
  .createQueryBuilder()
  .select(["UUID"])
  .from(Post, "post")
  .where("post.UUID = :UUID", { UUID : postId })
  .getOne()

  if(views === undefined){
    await getConnection()
    .createQueryBuilder()
    .update(Post)
    .set({ view : () => 'view + 1' })
    .where("post.UUID = :UUID", { UUID : postId })
    .execute();

    status = 200;
    body = {};
  }else{
    status = 403;
    body = await errorCode(601);
    
  }
  ctx.status = status;
  ctx.body = body;
});

export const postLike = (async (ctx) => {
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const { postId } = ctx.request.body;
  let body : object, status : number;

  if (firebaseToken !== 'error') {
    const post = await getConnection()
    .createQueryBuilder()
    .select("post")
    .from(Post, "post")
    .where("post.UUID = :UUID", { UUID: postId })
    .getOne()

    if(post !== undefined){
      const like = await getConnection()
      .createQueryBuilder()
      .select("like")
      .from(Like, "like")
      .where("like.PostUid = :PostUid", { PostUid: postId })
      .andWhere("like.userUid = userUid", { userUid: firebaseToken[0] })
      .getOne()

      if(like === undefined){
        await getConnection()
        .createQueryBuilder()
        .insert()
        .into(Like)
        .values({ userUid: firebaseToken[0], PostUid: postId })
        .execute();

        status = 201;
        body = {};
      }else{
        await getConnection()
        .createQueryBuilder()
        .delete()
        .from(Like)
        .where("like.PostUid = :PostUid", { PostUid: postId })
        .andWhere("like.userUid = userUid", { userUid: firebaseToken[0] })
        .execute();

        status = 200;
        body = {};
      }
    }else{
      status = 403;
      body = errorCode(601);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});

export const getLike = (async (ctx) => {
  const firebaseToken = await verify(ctx.header.firebasetoken);
  const { postId } = ctx.header;
  let body : object, status : number;

  if (firebaseToken !== 'error') {
    const post = await getConnection()
    .createQueryBuilder()
    .select("post")
    .from(Post, "post")
    .where("post.UUID = :UUID", { UUID: postId })
    .getOne()

    if (post !== undefined) {
      const like = await getConnection()
      .createQueryBuilder()
      .select(["post.num"])
      .from(Like, "like")
      .where("post.userUid = :uid", { uid: firebaseToken[0] })
      .andWhere("post.PostUUID = :postId", { postId: postId })
      .getMany();


      status = 200;
      if (like != undefined) {
        body = {answer: true}
      }else{
        body = {answer: false};
      }
    }else{
      status = 403;
      body = errorCode(601);
    }
  }else{
    status = 412;
    body = await errorCode(302);
  }

  ctx.status = status;
  ctx.body = body;
});