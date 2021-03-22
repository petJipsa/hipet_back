import { errorCode } from '../../lib/errorcode';
import dotenv from 'dotenv';
dotenv.config();


export const loadProfile = (async (ctx) => { 
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  let body,status,rows;
  
  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();

      if (rows[0] != undefined) {
        status = 200;
        body = {
          "nickname" : rows[0]['nickname'],
          "id" : rows[0]['id'],
          "address" : rows[0]['address'],
          "profileImage" : rows[0]['profileImage'],
          "introduce" : rows[0]['introduce']
        };
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

export const changeProfile = (async (ctx) => {
  const accesstoken = await jwtverify(ctx.request.header.accesstoken);
  const change = ctx.request.body.change.split(',');
  const options = ['nickname', 'id', 'password', 'address', 'profileImage', 'introduce'];
  let body, status, rows, mailStatus, ext, fileName;
  let sql = {};

  if (ctx.request.file != undefined){
    ext = ctx.request.file.originalname.split('.')[1];
    fileName = `${ctx.request.file.filename}`;
  }

  if(accesstoken[0]){
    try{
      rows = await User.find({id: accesstoken[1]}).limit(1).exec();
      sql['_id'] = rows[0]['_id'];

      if (ext !== 'png' && ext !== 'jpg' && ext !== 'gif' && ext !== 'jpeg') { throw new Error("extention invalid"); }
      
      for (let i=0; i < 6; i++) {
        if (change[i] == 'true'){
          if (options[i] == 'id') {
            sql['cert'] = false;
            sql[options[i]] = ctx.request.body[options[i]];
            mailStatus = await updateUserId(ctx.request.body[options[i]]);
            if (mailStatus == false) { throw new Error("email invalid"); }
          }else if (options[i] == 'password'){ sql[options[i]] = await crypto.createHmac('sha512', process.env.secret).update(ctx.request.body[options[i]]).digest('hex');
          }else if (options[i] == 'profileImage'){ sql[options[i]] = fileName;
          }else{ sql[options[i]] = ctx.request.body[options[i]]; }
        }else{ sql[options[i]] = rows[0][options[i]]; }
      }
      await User.updateOne(sql);
      await log('L102',`유저 정보 변경-${accesstoken[1]}`);

      status = 201;
      body = {};
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

export const loadImage = (async (ctx) => { 
  const { imagepath } = ctx.params;
  
  try {
   await send(ctx, imagepath, { root:  './files/' });
  }catch(err){
    ctx.status = 403;
    ctx.body = await errorCode(501);
  }
});