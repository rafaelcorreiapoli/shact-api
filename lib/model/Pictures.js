Pictures = new Mongo.Collection('pictures');

Pictures.Schema = new SimpleSchema({
  userId: {
    type: String
  },
  url: {
    type: String
  },
  taggedUsers: {
    type: [String],
    defaultValue: []
  },
  likesCount: {
    type: Number,
    defaultValue: 0
  },
  likesByUser: {
    type: [String],
    defaultValue: []
  },
  commentsCount: {
    type: Number,
    defaultValue: 0
  }
});

Pictures.attachSchema(Pictures.Schema);
Pictures.methods = {};


Pictures.methods.getPicture = function(pictureId) {
  return Pictures.findOne(pictureId);
};

//
//  GET pictures/
//  @own Boolean
//  @tag Boolean
//  @withUser String

Pictures.methods.list = function(userId, own, tag, withUser) {
  let queryParams = {};
  let neededTaggedUsers = [];
  let finalTag;
  let finalOwn;
  let finalWithUser;

  finalOwn = own;
  finalTag = tag;
  if (!own && !tag) {
    if (withUser) {   //  se só especificar withUser, assume que tem que tar tagado
      finalTag = true;
    } else {
      finalOwn = true;     // se não, assume que só quer as dele
    }
  }

  if (finalOwn) _.extend(queryParams, {userId: userId});  // apenas fotos que sou dono
  if (finalTag) neededTaggedUsers.push(userId);          //  apenas fotos que estou tagado
  if (withUser) neededTaggedUsers.push(withUser);   //  apenas fotos que este usuario também está tagado, mas tenho que ser dono ou estar tagado também
  if (neededTaggedUsers.length) {
    _.extend(queryParams, {
      taggedUsers: {
        $all: neededTaggedUsers
      }
    });
  }

  console.log(queryParams);
  return Pictures.find(queryParams).fetch();
};


//
//  POST pictures/
//  @userId
//  @url
//  throws    'failed-to-insert'
//
Pictures.methods.addPicture = function(userId, url) {
  let res = Pictures.insert({
    userId: userId,
    url: url
  });

  if (!res) throw new Error('failed-to-insert');
};

Pictures.methods.recognizePicture = function(pictureId) {
  // TODO: Sky Biometry
};


//
//  POST pictures/:id/like
//  throws    'already-liked'
//            'not-participant'
//            'failed-to-update'
Pictures.methods.like = function(userId, pictureId) {
  let picture = Pictures.findOne(pictureId);

  if (picture.isParticipant(userId)) {
    if (!picture.isLiker(userId)) { // se sou participante e ainda não dei like
      let res = Pictures.update({
        _id: pictureId
      }, {
        $inc: {
          likesCount: 1
        },
        $push: {
          likesByUser: userId
        }
      });
      if (!res) throw new Error('failed-to-update');
      return true;
    }
    throw new Error('already-liked');
  }
  throw new Error('not-participant');
};

//
//  POST picture/:id/unlike
//  throws    'not-a-liker'
//            'not-participant'
//            'failed-to-update'
Pictures.methods.unlike = function(userId, pictureId) {
  let picture = Pictures.findOne(pictureId);

  if (picture.isParticipant(userId)) {
    if (picture.isLiker(userId)) { // se sou participante e já dei like
      let res = Pictures.update({
        _id: pictureId
      }, {
        $inc: {
          likesCount: -1
        },
        $pull: {
          likesByUser: userId
        }
      });
      if (!res) throw new Error('failed-to-update');
      return true;
    }
    throw new Error('not-a-liker');
  }
  throw new Error('not-participant');
};

Pictures.helpers({
  isParticipant(userId) {
    // is owner or is tagged
    return _.contains(this.taggedUsers, userId) || this.userId === userId;
  },
  isOwner(userId) {
    return this.userId === userId;
  },
  isLiker(userId) {
    return _.contains(this.likesByUser, userId);
  }
});


/*
{
  "userId": "ObjectID(user)",
  "url": "https://url.com",
  "taggedUsers": [ObjectID(user), ObjectID(user)],
  "likesCount": 10, 
  "likesByUser": [ObjectID(user), ObjectID(user)],
  "tags": [
    {
      "hasOwner": true,            
      "userId": "ObjectID(user)",  // optional
      "taggedBy": "ObjectID(user)", //optional
      "candidates": [
          {
             userId: ObjectID(user),
             confidence: 56
          }
      ],
      "position": {
        "x": 35,
        "y": 12
      },
      "dimensios": {
        "width": 50,
        "height": 40
      }
    }
  ],
  "commentCount": 20,
  "comments": [
    {
      "userId": "ObjectID(user)",
      "username": "rafa93br",                   //denormalize
      "body": "This could be a long text...",
      "timestamp": "DateObject"
    }
  ]
}
*/
