Tags = new Mongo.Collection('tags');

Tags.PositionSchema = new SimpleSchema({
  x: {
    type: Number
  },
  y: {
    type: Number
  }
});

Tags.DimensionsSchema = new SimpleSchema({
  width: {
    type: Number
  },
  height: {
    type: Number
  }
});

Tags.CandidatesSchema = new SimpleSchema({
  userId: {
    type: String
  },
  confidence: {
    type: Number
  }
});

Tags.Schema = new SimpleSchema({
  pictureId: {
    type: String
  },
  hasOwner: {
    type: String,
    defaultValue: false
  },
  userId: {
    type: String
  },
  taggedBy: {
    type: String
  },
  candidates: {
    type: [Tags.CandidatesSchema]
  },
  position: {
    type: Tags.PositionSchema
  },
  dimensions: {
    type: Tags.DimensionsSchema
  }
});

Tags.attachSchema(Tags.Schema);


//
//  PUT tags/:id/associate
//  @tagId: id of the tag
//  @taggedUserId: id of the user to be tagged on that tag
//
Pictures.methods.associateTag = function(tagId, taggedUserId) {
  //  check if userId is in candidates
  let user = this.currentUser;
  let tag = Tags.findOne(tagId);
  let picture = tag.picture();

  if (picture.isParticipant(user._id)) { //  sou participante, posso tagar
    if (tag.isCandidate(userId)) { //  se quem eu quero tagar é candidato
      // colocar usuario na lista de usuarios tagados da Picture
      Pictures.update({
        _id: tag.pictureId,
      }, {
        $push: {
          taggedUsers: taggedUserId
        }
      });
      //  update na tag pra dizer quem foi tagado e por quem foi tagado
      Tags.update({
        _id: tagId,
      }, {
        $set: {
          hasOwner: true,
          userId: taggedUserId, //  quem foi tagado
          taggedBy: user._id //  quem tagou
        }
      });
    }
  }
};

//
//  PUT tags/:id/disassociate
//  @tagId: id of the tag
//
Pictures.methods.disassociateTag = function(tagId) {
  let user = this.currentUser;
  let tag = Tags.findOne(tagId);
  let picture = tag.picture();

  //  posso dessacoiar se sou eu tagado, se fui eu quem taguei ou se sou o dono da foto
  if (tag.taggedBy === user._id || tag.userId === user._id || picture.userId === user._id) {
    //  remover usuario da lista de usuarios tagados na Picture
    Pictures.update({
      _id: picture._id
    }, {
      $pull: {
        taggedUsers: tag.userId
      }
    });

    //  update na tag para voltar a ser anonima
    Tags.update({
      _id: tagId
    }, {
      $set: {
        hasOwner: false,
      },
      $unset: {
        userId: '',
        taggedBy: ''
      }
    });
  }
};


//
//  Helpers
//
Tags.helpers({
  picture() {
    return Pictures.findOne(this.pictureId);
  },
  isCandidate(userId) {
    return !!_.findWhere(this.candidates, {
      userId: userId
    });
  }
});
