JsonRoutes.add(POST, 'auth/pictures/', function(req, res) {
  let url = req.body.url;
  try {
    let pictureId = Pictures.methods.addPicture(req.userId, url);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        profileId: pictureId
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(GET, 'auth/pictures/', function(req, res) {
  let own = req.query.own || false;           //  I want photos I own
  let tag = req.query.tag || false;           //  I want photos I'm tagged
  let withUser = req.query.withUser || ''; // I want photos with this user

  try {
    let pictures = Pictures.methods.list(req.userId, own, tag, withUser);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        pictures: pictures
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(POST, 'auth/pictures/:id/like', function(req, res) {
  let userId = req.userId;
  let pictureId = req.params.id;

  try {
    Pictures.methods.like(userId, pictureId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(POST, 'auth/pictures/:id/unlike', function(req, res) {
  let userId = req.userId;
  let pictureId = req.params.id;

  try {
    Pictures.methods.unlike(userId, pictureId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});
