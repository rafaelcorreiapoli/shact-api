

JsonRoutes.add(POST, 'auth/users/expressions/:name', function(req, res) {
  let name = req.params.name;
  let url = req.body.url;
  try {
    Meteor.users.methods.setExpression(req.userId, name, url);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});

Meteor.publish(null, () => {
  return Meteor.users.find();
});

JsonRoutes.add(DELETE, 'auth/users/expressions/:name', function(req, res) {
  let name = req.params.name;
  console.log(name);
  try {
    Meteor.users.methods.deleteExpression(req.userId, name);
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } catch (e) {
    throw new Meteor.Error(e.message);
  }
});

Meteor.publish(null, () => {
  return Meteor.users.find({}, {fields:{
    connections: 1,
    expressions: 1
  }});
});
