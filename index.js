import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();



const app = express();
const port = 3000;
//middleware
app.use(express.static("public"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

// In-memory data store
let posts = [];

let lastId = 3;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// GET all posts
app.get("/", async (req, res) => {
  const result = await db.query("SELECT * FROM blogs ORDER BY id ASC");
  posts = result.rows;
  console.log(posts);

  try {
    res.render("index.ejs", {
      posts: posts,
    });
  } catch (error) {
    res.status(500).json({ messaage: error.message });
  }
});

// edit POST
app.get("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const result = await db.query("SELECT * FROM blogs WHERE id=$1", [id]);
  const data = result.rows[0];
  try {
    res.render("modify.ejs", {
      heading: "edit post",
      post: data,
      submit: "Update",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//update post
app.post("/api/posts/:id", async (req, res) => {
  const id = req.params.id;
  const { title, content, author } = req.body;
  try {
    await db.query(
      "UPDATE blogs SET title=$1, content=$2, author=$3 WHERE id=$4",
      [title, content, author, id]
    );
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// // clear a new post
app.get("/new", (req, res) => {
  try {
    res.render("modify.ejs", {
      heading: "Create New Post",
      submit: "create",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
//post new post
app.post("/api/posts", async (req, res) => {
  try {
    const title = req.body.title;
    const content = req.body.content;
    const author = req.body.author;
    await db.query(
      "INSERT INTO blogs (title,content,author)  VALUES($1, $2,$3)",
      [title, content, author]
    );
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET a specific post by id
app.get("/api/posts/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    await db.query("DELETE FROM blogs WHERE id=$1", [id]);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(port, () => {
  console.log(`API is running at http://localhost:${port}`);
});
