# Meteor.js Cheatsheet



## Collections
new collection:

    Quizzes = new Meteor.Collection("quizzes");



## Database Operations (mongo)
"Coll" will refer to the collection object (Quizzes, above).

The following will return the first collection object that has a "name" attribute with the value "something".
    myDocument = Coll.find({name: "something"}).fetch()[0];
    myDocument = Coll.findOne({name: "something"});

## Updating something in Mongo from the client
// find ID first, then update just that ID

    var quiz_id = Quizzes.findOne({name: storedName})['_id'];
    Quizzes.update({_id: quiz_id},{$set:{name: name}});


## Adding stuff to HTML dynamically
1. html template:

   {{#if new_cat}}
      <div class="category">
        <input type="text" id="add-category" value="" />
      </div>

    {{else}}
      <div class="category btn btn-inverse" id="btnNewCat">&plus;</div>
    {{/if}}



2. js -- new template variable:

  Template.categories.new_cat = function() {
    return Session.equals('adding_category', true);
  };


3. js -- Add session State, part 2:

 Session.set('adding_category', false);


4. js -- Add events:

  'keyup #add-category': function(e,t) {
      if (e.which === 13) {
        var catVal = String(e.target.value || "");
        if (catVal) {
          lists.insert({Category: catVal});
          Session.set("adding_category", false);
        }
      }
    },











