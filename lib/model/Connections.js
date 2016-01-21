const ACCEPTED = 'accepted';
const PENDING = 'pending';

Connections = new Mongo.Collection('connections');

Connections.Schema = new SimpleSchema({
  userId: {
    type: String
  },
  friendId: {
    type: String
  },
  status: {
    type: String,
    allowedValues: [PENDING, ACCEPTED, 'blocked']
  },
  receivedProfiles: {
    type: [String],
    defaultValue: []
  },
  sharedProfiles: {
    type: [String],
    defaultValue: []
  }
});


Connections.attachSchema(Connections.Schema);
Connections.methods = {};

//
//  Support functions
//
let setConnStatusForUser = function(userId, connectionId, status) {
  return Meteor.users.update({
    _id: userId,
    'connections.connectionId': connectionId
  }, {
    $set: {
      'connections.$.status': status
    }
  });
};

let pullConnForUser = function(userId, connectionId) {
  return Meteor.users.update({
    _id: userId,
  }, {
    $pull: {
      connections: {
        connectionId: connectionId
      }
    }
  });
};

let setConnStatus = function(connectionId, status) {
  return Connections.update({
    _id: connectionId
  }, {
    $set: {
      status: status
    }
  });
};


let checkProfileListForUser = function(userId, profiles) {
  // Check if all profiles exists and belongs to user
  let profilesCount = Profiles.find({
    _id: {
      $in: profiles
    },
    userId: userId,
  }).count();

  return (profiles.length === profilesCount);
};

//
//  POST /connections
//  @friendId: user you want to connect with
//  @sharedProfiles: array of profiles you want to share
//  throws        'connection-already-exists'
//                'invalid-profile-list'
//                'invalid-connection'
Connections.methods.addConnection = function(userId, friendId, sharedProfiles) {
  let user = Meteor.users.findOne(userId);
  // checar se já não existe conexao

  if (userId === friendId) throw new Error('invalid-connection');
  if (!checkProfileListForUser(user._id, sharedProfiles)) throw new Error('invalid-profile-list');

  let connection = Connections.findOne({
    friendId: friendId,
    userId: userId
  });
  if (connection) throw new Error('connection-already-exists');

  // connection requester -> requested
  let requesterUserConn = Connections.insert({
    userId: user._id, //  source
    friendId: friendId, // dest
    status: PENDING,
    receivedProfiles: [],
    sharedProfiles: sharedProfiles
  });

  if (!requesterUserConn) throw new Error('failed-to-insert');

  //  requester
  Meteor.users.update({
    _id: user._id
  }, {
    $addToSet: {
      connections: {
        userId: friendId,
        connectionId: requesterUserConn,
        status: 'requested'
      }
    }
  });


  //  requested
  Meteor.users.update({
    _id: friendId
  }, {
    $addToSet: {
      connections: {
        userId: user._id,
        connectionId: requesterUserConn,
        status: PENDING
      }
    }
  });

  return requesterUserConn;
};

//
//  GET connections/:id
//  @userId
//  @connectionId
//  throws      'failed-to-find-connection'
Connections.methods.getConnection = function(userId, connectionId) {
  let res = Connections.findOne({
    _id: connectionId,
    $or: [{
      friendId: userId
    }, {
      userId: userId
    }]
  });
  if (!res) throw new Error('failed-to-find-connection');
  return res;
};


//
//  POST connections/:id/accept
//  @connectionId
//  throws            'failed-to-update'
//                    'failed-to-accept-connection'
Connections.methods.accept = function(userId, connectionId) {
  //  apenas o usuario requested (friendId) pode aceitar a conexao
  let connection = Connections.findOne({
    _id: connectionId,
    friendId: userId,
    status: PENDING
  });

  if (connection) {
    // requester
    setConnStatusForUser(connection.userId, connection._id, ACCEPTED);
    // requested
    setConnStatusForUser(connection.friendId, connection._id, ACCEPTED);
    // connection
    let res = setConnStatus(connectionId, ACCEPTED);
    if (!res) throw new Error('failed-to-update');
    return true;
  }

  throw new Error('failed-to-accept-connection');
};


//
//  DELETE
//  connections/:id
//  @userId String
//  @connectionId String
//  throws       'failed-to-delete'
//               'failed-to-find-connection'
Connections.methods.delete = function(userId, connectionId) {
  // qualquer um dos dois pode deletar
  let connection = Connections.methods.getConnection(userId, connectionId);
  if (connection) {
    pullConnForUser(connection.friendId, connectionId);
    pullConnForUser(connection.userId, connectionId);
    let res = Connections.remove({
      _id: connectionId
    });

    if (!res) throw new Error('failed-to-delete');
    return true;
  }

  throw new Error('failed-to-find-connection');
};

//
//  POST connections/:id/share
//  @profiles: []
//  throws        'invalid-profile-list'
//               'failed-to-find-connection'
//                'failed-to-update'
Connections.methods.shareProfiles = function(userId, connectionId, profiles) {
  if (!checkProfileListForUser(userId, profiles)) throw new Error('invalid-profile-list');

  //  qualquer um dos dois pode mandar
  let connection = Connections.methods.getConnection(userId, connectionId);

  if (connection) {
    //  se user for o requester, profiles serão adicionados em sharedProfiles, se for o requested, em receivedProfiles
    destField = connection.userId === userId ? 'sharedProfiles' : 'receivedProfiles';

    var modifier = {
      $addToSet: {}
    };
    modifier.$addToSet[destField] = {$each: profiles};

    let res = Connections.update({
      _id: connectionId
    }, modifier);
    if (!res) throw new Error('failed-to-update');
    return true;
  }
  throw new Error('failed-to-find-connection');
};
