/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
var mongoose = require('mongoose'); 


//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true});

var bookSchema = mongoose.Schema({
  title: {type:String, required:true},               
  comments:[String],                               
  commentcount:  {type:Number, default: (this.comments) ? this.comments.length : 0 } 
})  

var bookCollection = mongoose.model("bookCollection", bookSchema)
  
module.exports = function (app) { 
                
  app.route('/api/books')  
    .get(function (req, res){    
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
     bookCollection.find({},"_id title commentcount",function(err, data){
       if(err){  
         console.log(err)
       }   
       else{
         res.send(data)
       }
     })
  })     
    
    .post(function (req, res){
      var title = req.body.title;
      var book = new bookCollection({
        title: title   
      })                 
        console.log(title)
      book.save(function(err, data){   
        if(err){
          console.log(err)
        }        
        else{  
          res.json({_id: data._id, title: data.title, comments: data.comments})  
        }
      })
      //response will contain new book object including atleast _id and title
            
    })      
    
    .delete(function(req, res){  
      //if successful response will be 'complete delete successful'
    bookCollection.deleteMany({}, function(err,data){
      if(err){
        console.log(err)
      }
      else{
        res.send('complete delete successful')
      }  
    })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    bookCollection.findOne({_id:bookid}, function(err, data){
      if(err){
          res.send('no book exists')
      }
      else{ 
        res.json({_id:data._id, title: data.title, comments: data.comments})
      }
    })
  })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
    bookCollection.findOne({_id: bookid}, function(err, data){
      if(err){
        res.send('no book exists')
      }
      else{   
        data.comments.push(comment)
        data.commentcount +=1
        data.save(function(err, data){
          if(err){
            console.log(err)
          }   
          else{
            res.json({_id:data._id, title: data.title, comments: data.comments})
          }
        })  
      }   
    })   
})
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
    
    bookCollection.findByIdAndRemove({_id: bookid}, function(err, res){
      if(err){
        console.log(err)
      }
      else{
        res.send('delete successful')
      }
    })
    });
  
};
