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

Session.set('chosenQuiz', "");
Session.set('mode', null);
Session.set('currentQuestionText', null);
Session.set('new_category_for_new_quiz', false);


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
};

Template.quizList.events({
  'click #btnClearChosenQuiz' : function(e,t) {
    Session.set('chosenQuiz', "");
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

Template.createQuiz.new_category = function() {
  return Session.get('new_category_for_new_quiz');
}
Template.createQuiz.new_question = function() {
  return Session.get('new_question_for_new_quiz');
}
Template.createQuiz.new_answer = function() {
  return Session.get('new_answer_for_new_quiz');
}
Template.createQuiz.currentQuestionText = function() {
  var cq = Session.get('currentQuestionText');
  if (cq) { return cq; } else { return false; }
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
      // reset state
      Session.set('new_category_for_new_quiz', false);
    }
  },

  'click #btnNewQuestion' : function(e,t) {
    Session.set('new_question_for_new_quiz', true);
    Session.set('currentQuestionText', null); // clear the selected question, if any
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
        if (name) { // if the field is not empty
          if (storedName) { // and there's a current quiz
            var quiz_id = getQuizIDbyName(storedName);
            Quizzes.update({_id: quiz_id},{$set:{name: name}});
          }
          else { // if there's a name in the field but no current quiz
            Quizzes.insert({name: name});
          }
          // in both cases, update the session value
          Session.set('chosenQuiz', name);
          e.target.value = ""; // clear input field
        }
      }
    },

  //// MODIFYING QUESTION TEXT
  'keyup #questionInput': function(e,t) {
    // user hits Enter
    if (e.which === 13) {
      clientUpdateQuestionText();
    }
  },


  'click #btnSaveAnswer': function(e,t) {
    // requires an existing question
    if (Session.get('currentQuestionText')) {

      // get the answer


      // done with the answer; remove the form
      Session.set('new_answer_for_new_quiz', false);
    }


  },


  'click #btnSaveQuestion': function(e,t) {
    // include case: when user hits this button instead of doing 'ENTER' on the question input field
        // run same stuff (abstract stuff out into a function, use in both this event and the ENTER event)
    clientUpdateQuestionText();
  },


  'click .question': function(e,t) {
    var tgt = $(e.target).parents('.question'); // top level (in case you clicked on an answer or something)
    var questiontext = tgt.children('.questiontext').text(); // further down in the DOM, find questiontext

    // out with the old...
    $('.question.selected').removeClass('selected');

    // in with the new...
    Session.set('currentQuestionText', questiontext);
    $(tgt).addClass('selected');
  },


  'click #btnClearCurrentQuestion': function(e,t) {
    Session.set('currentQuestionText', null);
  }

});





// Generic Helper Functions

// focus on an element
function focusText(i) {
  i.focus();
  i.select();
};

// return the quiz ID for a given quizname
// TODO: This needs to be refactored...check to see if quizname is UNDEFINED (because it could be)...and return a better error
function getQuizIDbyName(quizname) {
  if (quizname) {
    return Quizzes.findOne({name: quizname})['_id'];
  }
  else {
    console.log("Error: getQuizIDbyName called without a session.chosenQuiz");
    return false;
  }
}

function clientUpdateQuestionText() {
  var questiontext = $('#questionInput').val();
  console.log("questionInput value is " + questiontext);

  var currentQuizName = Session.get('chosenQuiz'); // current quiz name, if exists
  var currentQuestionText = Session.get('currentQuestionText');

  // field is not empty AND we're working on a quiz
  if (questiontext && currentQuizName) {
    var quiz_id = getQuizIDbyName(currentQuizName);

    if (currentQuestionText) { // if we're working on a question already
      console.log("about to update the question...");

      var UpdateParams = {
        id: quiz_id,
        currentText: currentQuestionText,
        replacementText: questiontext
      }

      Meteor.call("updateQuestionText", UpdateParams);
    }
    else { // if no question exists
            console.log("about to create a new question by updating the quiz...");
            Quizzes.update({_id: quiz_id},{$push:{questions: {text: questiontext}}}); // no answers yet
          }
          // in either case, update the Session var
          Session.set('currentQuestionText', questiontext);
          // make the question dialogue go away
          Session.set('new_question_for_new_quiz', false);
        }
  }


