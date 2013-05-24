Quizzes = new Meteor.Collection("quizzes");

Meteor.publish('Quizzes', function () {
   return Quizzes.find();
 });



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
      { _id: quizID, 'questions.text': questionText  } ,
      { $push: { 'questions.$.answers': {text: answerText, affected_categories: categories} } }
    );
  },


  deleteAnswerFromQuestion: function(params) {
    var quizID = params.id;
    var questionText = params.questionText;
    var answerText = params.answerText;

  },


  deleteQuestion: function(params) {
    var quizID = params.id;
    var questionText = params.questionText;

    Quizzes.update(
      { _id: quizID, 'questions.text': questionText },
      { $pull: { questions: {text: questionText } } }
    );
  } // end deleteQuestion function



}); // end Meteor.methods