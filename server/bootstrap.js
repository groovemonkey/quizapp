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