const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connection = require("./database/database");

const categoriesController=  require("./categories/categoriesController")
const articlesController=  require("./articles/articlesController")

const Category = require("./categories/Category");
const Articles = require("./articles/Articles");

// View Engine
app.set("view engine", "ejs");

// Static
app.use(express.static("public"));

// Body parser
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Database

connection
.authenticate()
.then(() => {
    console.log("Conexação feita com sucesso!");
}).catch((error) => {
    console.log(error);
})

app.use("/", categoriesController)
app.use("/", articlesController)


app.get("/", (req, res) => {
    Articles.findAll({
        order: [
            ['id', 'DESC']
        ],
        limit: 4
    }).then(articles => {
        Category.findAll().then(categories => {
            res.render("index", {articles: articles, categories: categories});
        })
    })
});

app.get("/:slug", (req, res) => {
    let slug = req.params.slug;
    Articles.findOne({
        where: {
            slug: slug
        }
    }).then(article => {
        if(article != undefined){
            Category.findAll().then(categories => {
                res.render("article", {article: article, categories: categories});
            })
        }else{
            res.redirect("/");
        }
    }).catch(err => {
        res.redirect("/");
    })
})

app.get("/category/:slug", (req, res) => {
    let slug = req.params.slug;
    Category.findOne({
        where: {
            slug: slug
        },
        include: [{model: Articles}]
    }).then( category => {
        if(category != undefined){
            Category.findAll().then(categories => {
                res.render("index", {articles: category.articles, categories: categories});
            })
        }else{
            res.redirect("/");
        }
    })
})


app.listen(8080, () => {
    console.log("O servidor está rodando")
});