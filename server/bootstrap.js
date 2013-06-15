Quizzes = new Meteor.Collection("quizzes");

// Meteor.publish('Quizzes', function () {
//    return Quizzes.find();
//  });



// insert sample quiz data if there are no quizzes
if (Quizzes.find().count() === 0) {
  Quizzes.insert({
    name: "Sample Quiz",
    author: "Dave",
    categories: [
      { name: "testcategory1", description: "this is a test category" }
      ,{ name: "categoryTWO", description: "the second category" }
    ],
    questions: [

      { text: "This is a question."
        ,answers: [
          {text: "Answer One", affected_categories: "testcategory1"}
          ,{text: "Answer Two", affected_categories: "testcategory1"}
          ,{text: "Answer Three", affected_categories: "categoryTWO"}
        ]
        ,answertype: "singlechoice"
      }

      ,{ text: "This is the second question."
        ,answers: [
          {text: "Mepho One", affected_categories: "testcategory1"}
          ,{text: "Answer Toodlydoo", affected_categories: "testcategory1"}
          ,{text: "Lehmen Sumtin", affected_categories: "categoryTWO"}
        ]
        ,answertype: "singlechoice"
      }
    ],
  });
};



// Methods
Meteor.methods({

  updateQuestionText: function(params) {
    var quizID = params.id;
    var currentText = params.currentText;
    var replacementText = params.replacementText;

    Quizzes.update(
      { _id: quizID, 'questions.text': currentText  } ,
      { $set: { 'questions.$.text': replacementText } }
    );
  },


  addAnswerToQuestion: function(params) {
    var quizID = params.id;
    var questionText = params.questionText;
    var answerText = params.answerText;
    var categories = params.categories;

    Quizzes.update(
      { _id: quizID, 'questions.text': questionText },
      { $push: { 'questions.$.answers': {text: answerText, affected_categories: categories }}}
    );
  },


  deleteAnswerFromQuestion: function(params) {
    var quizID = params.id;
    var questionText = params.questionText;
    var answerText = params.answerText;

     Quizzes.update(
       { _id: quizID, 'questions.text': questionText },
       {$pull:{ "questions.$.answers":{"text": answerText }}}
     );

  },


  deleteQuestion: function(params) {
    var quizID = params.id;
    var questionText = params.questionText;

    Quizzes.update(
      { _id: quizID, 'questions.text': questionText },
      { $pull: { questions: {text: questionText }}}
    );
  }, // end deleteQuestion function



  gradeQuiz: function(params) {
    //var quizName = params.quizName;
    var userAnswerPairs = params.answerPairs;
    var qID = params.quizID;
    var quiz = Quizzes.findOne({_id: qID});
    var questions = quiz.questions;
    var categories = quiz.categories;

    // create an object with a key for each category
    var scorecard = {};
    for (var i = categories.length - 1; i >= 0; i--) {
      scorecard[categories[i].name] = 0;
    }

    // for each userAnswerPair
    for (var i = userAnswerPairs.length - 1; i >= 0; i--) {
      var questionText = userAnswerPairs[i][1];
      var answerText = userAnswerPairs[i][0];

      // find the question with that text
      for (var j = questions.length - 1; j >= 0; j--) {
        if (questions[j].text == questionText) {
          var question = questions[j];

          // for each answer
          for (var k = question.answers.length - 1; k >= 0; k--) {

            // find the answer with that text
            if (question.answers[k].text == answerText) {
              // (for multiple categories, this needs to change) (for loop, iterate through categories)
              // check the weight and ++ the appropriate category.
              var category = question.answers[k].affected_categories;
              scorecard[category] += 1;
            }
           }
        }
      }
    }
    return scorecard;

  } // end gradeQuiz



}); // end Meteor.methods