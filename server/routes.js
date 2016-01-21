let getError = function(code, description, reason) {
  let error = new Meteor.Error(description, reason);
  error.statusCode = code;
  return error;
};

let getMeteorUser = function(req, res, next) {
  let userId = req.userId;
  if (!userId) throw getError(403, 'not-authorized');
  let user = Meteor.users.findOne(userId);
  if (!user) throw getError(403, 'user-not-found');
  req.currentUser = user;
  next();
};

//JsonRoutes.ErrorMiddleware.use(RestMiddleware.handleErrorAsJson);
JsonRoutes.Middleware.use('/auth', JsonRoutes.Middleware.parseBearerToken);
JsonRoutes.Middleware.use('/auth', JsonRoutes.Middleware.authenticateMeteorUserByToken);
JsonRoutes.Middleware.use('/auth', getMeteorUser);

JsonRoutes.add('post', 'auth/products/:productId/inc', function(req, res) {
  var productId = req.params.productId;
  var amount = req.body.amount;

  let product = Products.methods.increment(productId, amount);
  if (product) {
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        product: product
      }
    });
  } else {
    throw getError('failed-to-inc');
  }
});

JsonRoutes.add('delete', 'auth/products/:productId', function(req, res) {
  var productId = req.params.productId;
  let product = Products.methods.delete(productId);
  if (product) {
    JsonRoutes.sendResult(res, {
      data: {
        success: true
      }
    });
  } else {
    throw getError(300, 'failed-to-delete');
  }
});


JsonRoutes.add('post', 'auth/products', function(req, res) {
  var name = req.body.name;

  if (!name) throw getError(301, 'insufficient-params');

  let product = Products.methods.add(name);

  if (product) {
    JsonRoutes.sendResult(res, {
      data: {
        success: true,
        product: product
      }
    });
  }else {
    throw getError(300, 'failed-to-insert');
  }
});


JsonRoutes.add('get', 'auth/products', function(req, res) {
  let query = req.query;
  let products = Products.methods.listq(uery);

  JsonRoutes.sendResult(res, {
    data: products
  });
});
