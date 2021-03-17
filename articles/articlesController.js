const express = require("express");
const router = express.Router();
const Category = require("../categories/Category");
const Articles = require("./Articles");
const slugify = require("slugify");

router.get("/admin/articles", (req, res) => {
    Articles.findAll({
        include: [{model: Category}]
    }).then(articles => {
        res.render("admin/articles/index", {articles: articles})
    })
    
});

router.get("/admin/articles/new", (req, res) => {
    Category.findAll().then(categories => {
        res.render("admin/articles/new", {categories: categories});
    })
});

router.post("/articles/save", (req, res) => {
    let title = req.body.title
    let body = req.body.body
    let category = req.body.category

    Articles.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category
    }).then(() => {
        res.redirect("/admin/articles");
    });
});

router.post("/articles/delete", (req, res) => {
    let id = req.body.id;
    if(id != undefined) {
        if(!isNaN(id)){
            Articles.destroy({
                where: {
                    id: id
                }
            }).then(() => {
                res.redirect("/admin/articles")
            })

        }else{
            res.redirect("/admin/articles");
        }
    }else{
        res.redirect("/admin/articles");
    }
});

router.post("/articles/update", (req, res) => {
    let id = req.body.id;
    let title = req.body.title;
    let body = req.body.body;
    let category = req.body.category;

    Articles.update(
        {
            title: title,
            body: body,
            categoryId: category,
            slug: slugify(title)},{
        where: {
            id: id
        }
    }).then(() => {
            res.redirect("/admin/articles");
    }).catch(err => {
        res.redirect("/");
    })
});

router.get("/admin/articles/edit/:id", (req, res) => {
    let id = req.params.id;

    if(isNaN(id)){
        res.redirect("/admin/articles")
    }

    Articles.findByPk(id).then(article => {
        if(article != undefined) {

            Category.findAll().then(categories => {
                res.render("admin/articles/edit", {article: article, categories: categories});
            })
        }else{
            res.redirect("admin/articles");
        }
    }).catch(erro => {
        res.redirect("/admin/articles");
    })
});

router.get("/articles/page/:num", (req, res) => {
    let page = req.params.num;
    let offset = 0;

    if(!isNaN(page) || page != 1) {
        offset =( parseInt(page) - 1) * 4;
    }

    Articles.findAndCountAll({
        limit: 2,
        offset: offset,
        order: [
            ['id', 'DESC']
        ]
    }).then( articles => {

        let next = true;
        
        if(offset + 4 >= articles.count){
            next = false;
        }

        let result = {
            page: parseInt(page),
            articles: articles,
            next: next
        }
        
        Category.findAll().then(categories => {
            res.render("admin/articles/page", {result: result, categories: categories});
        });

        
    })
})


module.exports = router;