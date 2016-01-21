JsonRoutes.add(POST, 'auth/connections/', function(req, res) {
  let friendId = req.body.friendId || '';
  let profiles = (Array.isArray(req.body.profiles) && req.body.profiles) || [];

  if (!friendId) throw new Meteor.Error('invalid-arguments');
  try {
    let connection = Connections.methods.addConnection(req.userId, friendId, profiles);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        connection: connection
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(GET, 'auth/connections/:id', function(req, res) {
  let connectionId = req.params.id || '';

  try {
    let connection = Connections.methods.getConnection(req.userId, connectionId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        connection: connection
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(DELETE, 'auth/connections/:id', function(req, res) {
  let connectionId = req.params.id || '';

  try {
    Connections.methods.delete(req.userId, connectionId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(POST, 'auth/connections/:id/share', function(req, res) {
  let connectionId = req.params.id || '';
  let profiles = (Array.isArray(req.body.profiles) && req.body.profiles) || [];
  try {
    Connections.methods.shareProfiles(req.userId, connectionId, profiles);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});


JsonRoutes.add(POST, 'auth/connections/:id/accept', function(req, res) {
  let connectionId = req.params.id || '';

  try {
    Connections.methods.accept(req.userId, connectionId);
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});
