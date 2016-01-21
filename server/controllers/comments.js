const DEFAULT_COMMENTS_PAGE_LENGTH = 5;

JsonRoutes.add(POST, 'auth/pictures/:id/comments/', function(req, res) {
  let pictureId = req.params.id;
  let body = req.body.body;

  try {
    let comment = Comments.methods.postComment(req.userId, pictureId, body);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        pictures: comment
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(DELETE, 'auth/comments/:id', function(req, res) {
  let commentId = req.params.id;
  try {
    Comments.methods.deleteComment(req.userId, commentId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(GET, 'auth/pictures/:id/comments/', function(req, res) {
  let pictureId = req.params.id;
  let start = parseInt(req.query.start, 10);
  let length = parseInt(req.query.length || DEFAULT_COMMENTS_PAGE_LENGTH, 10);
  

  try {
    comments = Comments.methods.paginateComments(req.userId, pictureId, start, length);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        comments: comments
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});
