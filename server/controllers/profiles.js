JsonRoutes.add(POST, 'auth/profiles/', function(req, res) {
  let network = req.body.network;
  let name = req.body.name;
  try {
    let profileId = Profiles.methods.addProfile(req.userId, name, network);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        profileId: profileId
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});

JsonRoutes.add(GET, 'auth/profiles/', function(req, res) {
  try {
    let profiles = Profiles.methods.list(req.userId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        profiles: profiles
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});

JsonRoutes.add(PUT, 'auth/profiles/:profileId', function(req, res) {
  let name = req.body.name;
  let profileId = req.params.profileId;
  try {
    Profiles.methods.updateProfile(req.userId, profileId, name);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(DELETE, 'auth/profiles/:profileId', function(req, res) {
  let profileId = req.params.profileId;
  try {
    Profiles.methods.deleteProfile(req.userId, profileId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});
