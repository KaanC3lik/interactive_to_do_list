//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose, get } = require("mongoose");
const date = require(__dirname + "/date.js");
const _ = require("lodash")

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://kaan:test123@cluster0.ygt8zon.mongodb.net/todolistDB")

const itemsSchema ={
  name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "welcome to your todolist"
})
const item2 = new Item({
  name: "Hiit the + button to add a item"
})
const item3 = new Item({
  name: "<-- Hit this to delete an item"
})

const defaultItems = [item1, item2, item3] 

listSchema ={
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)


app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        }
        else{
          console.log("Succesful")
        }
      })
      res.redirect("/")
    }
    else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list

  const newAddedItem = new Item({
    name: itemName
  })

  if(listName === "Today"){
    newAddedItem.save()
    res.redirect("/")
  }
  else{
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(newAddedItem)
      foundList.save()
      res.redirect("/"+listName)
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  const hiddenListName = req.body.hiddenListName

  if(hiddenListName === "Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(!err){
        console.log("succesfully deletet item")
        res.redirect("/")
      }
    })
  }
  else{
    List.findOneAndUpdate({name: hiddenListName}, {$pull: {items: {_id: checkedItemId}}}, function(err,){
      if(!err){
        console.log("we coudl'nt delete the item")
        res.redirect("/" + hiddenListName)
      }
    })
  }
})

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName)
  List.findOne({name: customListName}, function(err, foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name: customListName,
          Items: defaultItems
        })
        list.save()
        res.redirect("/"+customListName)
      }
      else{
        res.render("list", {listTitle: foundList.name , newListItems: foundList.items});
      }
    }
  })
})

app.get("/about", function(req, res){
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
