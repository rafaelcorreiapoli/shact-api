const NETWORKS = ['facebook', 'instagram', 'twitter', 'snapchat', 'googleplus', 'mail', 'cellphone'];
Profiles = new Mongo.Collection('profiles');

Profiles.Schema = new SimpleSchema({
  userId: {
    type: String
  },
  name: {
    type: String
  },
  network: {
    type: String,
    allowedValues: NETWORKS,
    maxCount: NETWORKS.length
  }
});


Profiles.attachSchema(Profiles.Schema);
Profiles.methods = {};

//
//  GET profiles/
//  @userId String
//
Profiles.methods.list = function(userId) {
  return Profiles.find({
    userId: userId
  }).fetch();
};


//
//  POST profiles/
//  @userId
//  @name
//  @network
//  throws    'invalid-network'
//            'failed-to-insert'
//            'profile-already-registered'
//
Profiles.methods.addProfile = function(userId, name, network) {
  if (_.contains(NETWORKS, network)) {
    let profile = Profiles.findOne({
      userId: userId,
      network: network
    });

    if (profile) throw new Error('profile-already-registered');

    let res = Profiles.insert({
      userId: userId,
      name: name,
      network: network
    });

    if (!res) throw new Error('failed-to-insert');
    return res;
  }
  throw new Error('invalid-network');
};


//
//  PUT profiles/:profileId
//  @userId
//  @profileId
//  @name
//  throws    'failed-to-update'
//
Profiles.methods.updateProfile = function(userId, profileId, name) {
  let res = Profiles.update({
    _id: profileId,
    userId: userId
  }, {
    $set: {
      name: name
    }
  });
  if (!res) throw new Error('failed-to-updated');
};

//
//  PUT profiles/:profileId
//  @userId
//  @profileId
//  throws    'failed-to-delete'
//
Profiles.methods.deleteProfile = function(userId, profileId) {
  let res = Profiles.remove({
    _id: profileId,
    userId: userId
  });

  if (!res) throw new Error('failed-to-delete');
  return res;
};
