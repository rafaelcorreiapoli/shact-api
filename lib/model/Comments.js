const MAX_COMMENTS_SENT = 10;

Comments = new Mongo.Collection('comments');
Comments.Schema = new SimpleSchema({
  pictureId: {
    type: String
  },
  userId: {
    type: String
  },
  username: {
    type: String
  },
  body: {
    type: String
  }
});

Comments.attachSchema(Comments.Schema);
Comments.methods = {};
//
//  POST comments/
//  @pictureId: picture that the comment will be posted
//  @body: body of the comment
//  throws      'failed-to-insert'
//              'user-is-not-participant'

Comments.methods.postComment = function(userId, pictureId, body) {
  let user = Meteor.users.findOne(userId);
  let picture = Pictures.findOne(pictureId);

  if (picture.isParticipant(userId)) {  //  se sou participante posso comentar
    //  inserir comentario
    let comment = Comments.insert({
      pictureId: pictureId,
      userId: userId,
      username: user.username,
      body: body,
    });

    //  aumentar contador de comentários
    Pictures.update({
      _id: pictureId,
    }, {
      $inc: {
        commentsCount: 1
      }
    });

    if (!comment) throw new Error('failed-to-insert');
    return comment;
  }
  throw new Error('user-is-not-participant');
};

//
//  DELETE comments/:id
//  @userId String
//  @commentId String
//  throws        'failed-to-delete'
//                'not-authorized-to-delete'
Comments.methods.deleteComment = function(userId, commentId) {
  let comment = Comments.findOne(commentId);
  let picture = comment.picture();

  if (comment.isOwner(userId) || picture.isOwner(userId)) {
    //  descrescer 1 no contador de comentarios da foto
    Pictures.update({
      _id: picture._id,
    }, {
      $inc: {
        commentsCount: -1
      }
    });

    // remover comentário
    let res = Comments.remove({
      _id: commentId
    });

    if (!res) throw new Error('failed-to-delete');
    return true;
  }
  throw new Error('not-authorized-to-delete');
};

//
//  GET comments/
//  @pictureId
//  @start
//  @length
//  throws      'not-authorized-to-page-comments'
Comments.methods.paginateComments = function(userId, pictureId, start, length) {
  let picture = Pictures.findOne(pictureId);
  let trueLength = (length > MAX_COMMENTS_SENT) ? MAX_COMMENTS_SENT : length;
  

  if (picture.isParticipant(userId)) {
    return Comments.find({
      pictureId: pictureId,
    }, {
      skip: start,
      limit: trueLength
    }).fetch();
  }

  throw new Error('not-authorized-to-page-comments');
};


//
//  Helpers
//
Comments.helpers({
  picture() {
    return Pictures.findOne(this.pictureId);
  },
  isOwner(userId) {
    return this.userId === userId;
  }
});
