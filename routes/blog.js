const { render } = require("ejs");
const express = require("express");
const router = express.Router();
const db = require("../data/database");

router.get("/",function(req,res){
  res.redirect("/posts");
})

router.get("/posts", async function(req,res){
  const [posts] = await db.query("SELECT posts.*, authors.name AS author_name FROM posts INNER JOIN authors ON (posts.author_id = authors.id)");
  res.render("posts-list",{posts : posts});
});

router.get("/posts/:id",async function(req,res){
  const id = req.params.id;
  const query = `SELECT posts.*,
  authors.name AS author_name,
  authors.email AS author_email
  FROM posts INNER JOIN authors ON (posts.author_id = authors.id) 
  WHERE posts.id = ?`;
  const [posts] = await db.query(query,id);
  if (!posts || posts.length === 0) {
    res.status(400).render("404");
    return;
  }
  posts[0].dateHuman = posts[0].date.toLocaleDateString("en-us",{
    weekday : "long",
    year : "numeric",
    month : "long",
    day: "numeric"
  });
  posts[0].date = posts[0].date.toISOString();
  res.render("post-detail",{post : posts[0]});
});

router.get("/new-post",async  function(req,res){
  const [authors] = await db.query("SELECT * FROM authors");
  res.render("create-post", {authors:authors});
});

router.post("/posts", async function(req,res){
  const data = [req.body.title,req.body.summary,req.body.content,req.body.author];
  await db.query("INSERT INTO posts (title,summary,body,author_id) VALUES(?)",[data]);
  res.redirect("/posts");
});

router.get("/posts/update/:id", async function(req,res){
  const id = req.params.id;
  const query = `SELECT * FROM posts
  WHERE id = ?`;
  const [posts] = await db.query(query,id);
  if (!posts || posts.length === 0) {
    res.status(404).render("404");
    return;
  }
  res.render("update-post",{post:posts[0]});
})

router.post("/posts/update/:id",async function(req,res){
  const id = req.params.id ;
  const newData = req.body;
  const query = `UPDATE posts SET title = ? , summary = ? , body = ? WHERE id = ?`;
  await db.query(query,[newData.title,newData.summary,newData.content,id]);
  res.redirect("/posts");
})

router.post("/posts/delete/:id",async function(req,res){
  const id = req.params.id;
  const query = `DELETE FROM posts WHERE id = ?`;
  await db.query(query,[id]);
  res.redirect("/posts");
})


module.exports = router;