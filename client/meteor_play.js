Quizzes = new Meteor.Collection("quizzes");

Meteor.subscribe("Quizzes");



Template.quizList.events({

  // selecting a quiz to take
  'click span' : function() {
    // get name of selected quiz
    Session.set('chosenQuiz', this.name);
  },
  'click #btnCreateQuizMode' : function(e,t) {
    Session.set('mode', 'createQuiz');
  },
  'click #btnTakeQuizMode' : function(e,t) {
    Session.set('mode', 'takeQuiz');
  }
});


/////////////////////////

Session.set('chosenQuiz', null);
Session.set('mode', null);


// this is fucking retarded, because I can't put any view-logic in the view (a la ERB)
Template.bodyTemplate.mode_is_takeQuiz = function() {
  if (Session.equals('mode', 'takeQuiz')) {
    return true;
  }
  else {
    return false;
  }
};

Template.bodyTemplate.mode_is_createQuiz = function() {
  if (Session.equals('mode', 'createQuiz')) {
    return true;
  }
  else {
    return false;
  }
};



////// quizList template
Template.quizList.selectedMode = function() {
  return Session.get('mode');
};
Template.quizList.quizzes = function() {
  return Quizzes.find();
};
Template.quizList.selectedQuiz = function() {
  return Quizzes.findOne({name: Session.get('chosenQuiz')});
}

Template.quizList.events({
  'click #btnClearChosenQuiz' : function(e,t) {
    Session.set('chosenQuiz', null);
  }

}); // end quizList template events





// SelectedQuiz Template
Template.selectedQuiz.quiz = function() {
  return Quizzes.findOne({name: Session.get('chosenQuiz')});
};






///// QUIZ CREATION

Template.createQuiz.quiz = function() {
  var quizname = Session.get('chosenQuiz');
  if (quizname) {
    return Quizzes.findOne({name: quizname});
  }
};

Session.set('new_category_for_new_quiz', false);

Template.createQuiz.new_category = function() {
  return Session.get('new_category_for_new_quiz');
}
Template.createQuiz.new_question = function() {
  return Session.get('new_question_for_new_quiz');
}
Template.createQuiz.new_answer = function() {
  return Session.get('new_answer_for_new_quiz');
}


/////// Quiz Creation Events
Template.createQuiz.events({
  'click #btnNewCategory' : function(e,t) {
    Session.set('new_category_for_new_quiz', true);
    Meteor.flush();
    focusText(t.find("#quizCategory"));
  },
  'click #btnAddCategory' : function(e,t) {
    var namefield = $('#quizCategory');
    var descfield = $('#quizCategoryDescription');
    var name = namefield.val();
    var description = descfield.val();
    var storedName = Session.get('chosenQuiz');

    // can't insert a category unless a quiz is selected and the category has a name
    if (name && storedName) {
      var quiz_id = Quizzes.findOne({name: storedName})['_id'];
      Quizzes.update({_id: quiz_id},{$push: {categories: {name: name, description: description}}});

      // clear the input fields
      $(namefield).val('');
      $(descfield).val('');
    }
  },
  'click #btnNewQuestion' : function(e,t) {
    Session.set('new_question_for_new_quiz', true);
    Meteor.flush();
    focusText(t.find("#questionInput"));
  },
  'click #btnNewAnswer' : function(e,t) {
    Session.set('new_answer_for_new_quiz', true);
    Meteor.flush();
    focusText(t.find("#answerInput"));
  },

  /////// THIS FUNCTION CREATES A NEW, UNFINISHED OBJECT.
  'keyup #newQuizName': function(e,t) {
      if (e.which === 13) {
        var name = String(e.target.value || "");
        var storedName = Session.get('chosenQuiz');

          // if the field is not empty
        if (name) {
          if (storedName) {
            var quiz_id = Quizzes.findOne({name: storedName})['_id'];
            Quizzes.update({_id: quiz_id},{$set:{name: name}});
          }
          else {
            Quizzes.insert({name: name});
          }

          // in both cases, update the session value
          Session.set('chosenQuiz', name);
         // clear input field
          e.target.value = "";
        }
      }
    },

  'click #btnSaveAnswer': function(e,t) {
    // save the answer


    Session.set('new_answer_for_new_quiz', false);
  },


  'click #btnSaveQuestion': function(e,t) {

    Session.set('new_question_for_new_quiz', false);
  }

});





// Generic Helper Functions

// focus on an element
function focusText(i) {
  i.focus();
  i.select();
};



