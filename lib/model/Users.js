const EXPRESSIONS = ['happy', 'sad', 'scared', 'sexy', 'angry', 'suspicious'];
const ACCEPTED = 'accepted';
const PENDING = 'pending';
const BLOCKED = 'blocked';
const REQUESTED = 'requested';

Meteor.users.ExpressionsSchema = new SimpleSchema({
  name: {
    type: String
  },
  url: {
    type: String
  }
});

Meteor.users.ConnectionsLinkerSchema = new SimpleSchema({
  userId: {
    type: String
  },
  connectionId: {
    type: String
  },
  status: {
    type: String,
    allowedValues: [REQUESTED, PENDING, ACCEPTED, BLOCKED]
  }
});

Meteor.users.ProfileSchema = new SimpleSchema({
  name: {
    type: String
  },
  lowerName: {
    type: String,
    autoValue() {
      var nome = this.field('profile.nome').value;
      if (nome) {
        return nome.toLowerCase();
      }
    }
  },
  avatar: {
    type: String
  }
});

Meteor.users.Schema = new SimpleSchema({
  username: {
    type: String,
    optional: true
  },
  emails: {
    type: [Object],
    optional: true,
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email,
  },
  "emails.$.verified": {
    type: Boolean
  },
  profile: {
    type: Meteor.users.ProfileSchema,
    optional: true,
    blackbox: true
  },
  services: {
    type: Object,
    optional: true,
    blackbox: true
  },
  roles: {
    type: Object,
    optional: true,
    blackbox: true
  },
  status: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  registered_emails: {
    type: [Object],
    blackbox: true,
    optional: true
  },
  connections: {
    type: [Meteor.users.ConnectionsLinkerSchema],
    optional: true
  },
  expressions: {
    type: [Meteor.users.ExpressionsSchema],
    allowedValues: EXPRESSIONS,
    maxCount: EXPRESSIONS.length,
    optional: true
  }
});

Meteor.users.attachSchema(Meteor.users.Schema);
Meteor.users.methods = {};

Meteor.users.methods.editProfile = function(profile) {
  let userId = this.currentUserId;

  return Meteor.users.update({
    _id: userId
  }, {
    $set: {
      profile: profile
    }
  });
};

//
//  POST auth/user/expressions/:expression
//  @userId
//  @expression
//  @url
//  throws    'failed-to-insert'
//            'expression-already-registered'
//            'invalid-expression'
//
Meteor.users.methods.setExpression = function(userId, expression, url) {
  let user = Meteor.users.findOne(userId);

  if (_.contains(EXPRESSIONS, expression)) {
    if (!user.hasExpression(expression)) {
      let res = Meteor.users.update({
        _id: userId
      }, {
        $push: {
          expressions: {
            name: expression,
            url: url
          }
        }
      });

      if (!res) throw new Error('failed-to-insert');
      return res;
    }
    throw new Error('expression-already-registered');
  }

  throw new Error('invalid-expression');
};

//
//  DELETE auth/user/expressions/:expression
//  @userId
//  @expression
//  throws    'failed-to-remove'
//            'invalid-expression'
//
Meteor.users.methods.deleteExpression = function(userId, expression) {
  if (_.contains(EXPRESSIONS, expression)) {
    let res = Meteor.users.update({
      _id: userId,
    }, {
      $pull: {
        expressions: {
          name: expression
        }
      }
    });

    if (!res) throw new Error('failed-to-remove');
    return true;
  }
  throw new Error('invalid-expression');
};


Meteor.users.methods.getFriends = function() {
  let user = this.currentUser;
  return user.getConnList(ACCEPTED);
};

Meteor.users.methods.getRequested = function() {
  return user.getConnList(REQUESTED);
};

Meteor.users.methods.getPendings = function() {
  return user.getConnList(PENDING);
};

Meteor.users.helpers({
  getConnection(friendId) {
    return Connections.findOne({
      userId: userId,
      friendId: friend._id
    });
  },
  hasExpression(expression) {
    return _.findWhere(this.expressions, {
      name: expression
    });
  },
  getConnList(filter) {
    let connArray = _.filter(this.connections, function(conn) {
      return conn.status === filter;
    });

    return connArray.map((conn) => {
      let connUser = Meteor.users.findOne(conn.userId);
      return _.extend(conn, {
        user: connUser
      });
    });
  }
});
