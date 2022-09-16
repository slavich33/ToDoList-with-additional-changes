//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://slavich33:Zi8505348@cluster0.3mu24ik.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});
// singular version of model name
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your to do list!"
});

const item2 = new Item({
  name: "Just a second item"
});

const item3 = new Item({
  name: "Just a third item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, items){

    if (items.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if(err) {
          console.log(err);
        } else {
          console.log("Succesfully added to the dataBase");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {listTitle: "Today", newListItems: items});
    }
  });
});

  app.get('/:customListName', (req, res) => {

    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, result) {
      if (!err) {
        if (!result) {
          // Create new list
            const list = new List({
              name: customListName,
              items: defaultItems
            });
            list.save();
            res.redirect("/" + customListName);
        } else {
          // Show an existed list
            res.render("list",{listTitle: result.name, newListItems: result.items} )
        }
  };
  });


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
      item.save();
      res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkBox;
  const listName = req.body.listName;

  if(listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Succesfully deleted checked item!");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList) {
      if (!err){
        res.redirect("/" + listName);
      };
    });
  }

});


app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("App started Succesfully!");
});
