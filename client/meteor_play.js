Quizzes = new Meteor.Collection("quizzes");
Meteor.subscribe("Quizzes");

////////// Set Up Session Variables //////////

Session.set('chosenQuiz', "");
Session.set('mode', null);
Session.set('currentQuestionText', null);
Session.set('new_category_for_new_quiz', false);
Session.set('quizResults', null);

//////////////////////////////////////////////


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
    if (Session.get('chosenQuiz')) {
      Session.set('mode', 'takeQuiz');
    }
    else {
      alert("You need to select a quiz (above) before you can take it!");
    }
  }

}); // end Template.quizList.events()





/////////////////////////

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




// chosenQuizName template -- is there a better way to deal with markup?
Template.chosenQuizName.selectedQuiz = function() {
 return getSelectedQuiz();
};

Template.chosenQuizName.events({
  'click .btnClearChosenQuiz' : function(e,t) {
    Session.set('chosenQuiz', "");
  }
});




////// quizList template
Template.quizList.selectedMode = function() {
  return Session.get('mode');
};
Template.quizList.quizzes = function() {
  return Quizzes.find();
};
Template.quizList.selectedQuiz = function() {
  return getSelectedQuiz();
};

Template.quizList.events({
// THERE ARE NO EVENTS FOR QUIZLIST

}); // end quizList template events





// SelectedQuiz Template
Template.selectedQuiz.quiz = function() {
  return Quizzes.findOne({name: Session.get('chosenQuiz')});
};

Template.selectedQuiz.results = function() {
  var resultScoreCard = Session.get('quizResults');
  
  if (resultScoreCard) {
    return judgeQuizOutcome(resultScoreCard);
  }
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
};
Template.createQuiz.new_question = function() {
  return Session.get('new_question_for_new_quiz');
};
Template.createQuiz.new_answer = function() {
  return Session.get('new_answer_for_new_quiz');
};
Template.createQuiz.currentQuestionText = function() {
  var cq = Session.get('currentQuestionText');
  if (cq) { return cq; } else { return false; }
};
Template.createQuiz.currentQuizID = function() {
  var storedName = Session.get('chosenQuiz');
  return Quizzes.findOne({name: storedName})['_id'];
};



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
    var quiz_id = Template.createQuiz.currentQuizID();

    // can't insert a category unless a quiz is selected and the category has a name
    if (name && quiz_id) {
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
    Session.set('new_answer_for_new_quiz', false); // prevent strange answer-form behavior
    Session.set('currentQuestionText', null); // clear the selected question, if any
    Meteor.flush();
    focusText(t.find("#questionInput"));
  },

  'click .btnDeleteQuestion' : function(e,t) {
    if (confirm("Are you sure you want to delete this question?")) {
      var tgt = $(e.target).parents('.question');
      var questiontext = tgt.children('.questiontext').text();
      var quiz_id = Template.createQuiz.currentQuizID();

      // delete it
      var params = {
        questionText: questiontext,
        id: quiz_id
      };

      Meteor.call("deleteQuestion", params);

      // clear the deleted question
      Session.set('currentQuestionText', null);
    } // end if
  },

  'click .btnDeleteAnswer' : function(e,t) {
    if (confirm("Are you sure you want to delete this answer?")) {
      var tgt = $(e.target).parents('.answer');
      var questionText = $(tgt).parents('.question').children('.questiontext').text();
      var answerText = $(tgt).children('span').text();
      var quiz_id = Template.createQuiz.currentQuizID();

      var params = {
        id: quiz_id,
        questionText: questionText,
        answerText: answerText
      };

      Meteor.call("deleteAnswerFromQuestion", params);
    }
  },

  'click .btnNewQuizToEdit': function(e,t) {
    Session.set('chosenQuiz', "");
  },


  'click #btnNewAnswer': function(e,t) {
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
            var quiz_id = Template.createQuiz.currentQuizID();
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
    var questionText = Session.get('currentQuestionText');
    if (questionText) {

      // get the answer
      var answerText = $('#answerInput').val();
      var answerCategory = $('#answerCategoryDropdown').val();
      var quiz_id = Template.createQuiz.currentQuizID();

      // call the Server method to add an answer
      var params = {
        id: quiz_id,
        questionText: questionText,
        answerText: answerText,
        categories: answerCategory
      };

      Meteor.call("addAnswerToQuestion", params);

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
    if ( $(e.target).is('button') ) {
      // if you clicked on the delete button for a question or answer, DONT DO ANYTHING
      return;
    }
    else {
      var tgt = $(e.target).parents('.question'); // top level (in case you clicked on an answer or something)
      var questiontext = tgt.children('.questiontext').text(); // further down in the DOM, find questiontext

      // In case we had a "new question" form open, close it.
      Session.set('new_question_for_new_quiz', false);

      // out with the old...
      $('.question.selected').removeClass('selected');

      // in with the new...
      Session.set('currentQuestionText', questiontext);
      $(tgt).addClass('selected');
    }

  },


  'click #btnClearCurrentQuestion': function(e,t) {
    Session.set('currentQuestionText', null);

    // if we were filling in an answer, forget it
    Session.set('new_answer_for_new_quiz', false);
  }

}); ////// END Template.createQuiz.events()




Template.selectedQuiz.events({
  ///////                   ///////
   /////// GRADING THE QUIZ  ////////
  ///////                   ///////
  'click #submitQuizAnswers': function(e,t) {
    var qName = Session.get('chosenQuiz');
    var qID = Quizzes.findOne({name: qName})['_id'];

    var selectedAnswers = $('.answerCheckBox:checked').map(function() {
        var answerText = $($(this).siblings('.answerText')[0]).text();
        var questionText = $($($(this).parents('.question')[0]).children('.questiontext')[0]).text();
        return [[answerText, questionText]];
    }).get();

    var params = {
      //quizName: qName,
      quizID: qID,
      answerPairs: selectedAnswers
    };

    Meteor.call('gradeQuiz', params, function(err, data) {
      if (err) { console.log("Error in getting scorecard from the back-end:\n" + err); }
      else {
        Session.set('quizResults', data);
      }
    });
  }, // end submitQuizAnswers


  'click #quizResults .close': function(e,t) {
    Session.set('quizResults', false);
  }


}); ////// END Template.selectedQuiz.events()





// Generic Helper Functions

// get a selected quiz
function getSelectedQuiz() {
  return Quizzes.findOne({name: Session.get('chosenQuiz')});
}

// focus on an element
function focusText(i) {
  i.focus();
  i.select();
}

function judgeQuizOutcome(scorecard) {
  var tie = []; //this holds all cat objects which match the highest score
  var highestScore = 0;
  var winningCat = [];

  // for each cat-score pair in scorecard
  for (var catName in scorecard) {

      if(scorecard.hasOwnProperty(catName)) {
        if (scorecard[catName] > highestScore) {
          winningCat = [{name: catName}];
          highestScore = scorecard[catName];
          // zero out tie, in case there is one
          tie = [];
        }
        // there's a tie!
        else if (scorecard[catName] == highestScore) {
          tie.push(winningCat[0]);
          tie.push({name: catName});
        }
      }
    }

    if (tie[0]) {
      return {
        isTie: true,
        winner: tie,
        score: highestScore
      };
    }
    // Not Tied
    else {
      return {
        isTie: false,
        winner: winningCat,
        score: highestScore
      };
    }
}

function clientUpdateQuestionText() {
  var questiontext = $('#questionInput').val();

  var currentQuizName = Session.get('chosenQuiz'); // current quiz name, if exists
  var currentQuestionText = Session.get('currentQuestionText');

  // field is not empty AND we're working on a quiz
  if (questiontext && currentQuizName) {
    var quiz_id = Template.createQuiz.currentQuizID();

    if (currentQuestionText) { // if we're working on a question already
      var UpdateParams = {
        id: quiz_id,
        currentText: currentQuestionText,
        replacementText: questiontext
      };

      Meteor.call("updateQuestionText", UpdateParams);
    }
    else { // if no question exists
            Quizzes.update({_id: quiz_id},{$push:{questions: {text: questiontext}}}); // no answers yet
          }
          // in either case, update the Session var
          Session.set('currentQuestionText', questiontext);
          // make the question dialogue go away
          Session.set('new_question_for_new_quiz', false);
        }
  }


