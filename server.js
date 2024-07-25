/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name:Jiyad Mohammed Arif Shaikh Student ID: Jmashaikh1 Date: 25/07/2024
*
* Online (Heroku) Link: https://quiet-mountain-88305-ee8cddee52e6.herokuapp.com/
*
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
const collegeData = require('./modules/collegeData');
const path = require('path');
const exphbs = require('express-handlebars')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs',
    helpers: { 
        //custom helper function to fix navbar
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') + 
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }           
    }
}));
app.set('view engine', '.hbs');

//add activeRoute property to fix nav bar
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
    next();
});

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.render('home', {layout: 'main'});
});

app.get("/about", (req, res) => {
    res.render('about', {layout: 'main'});
});

app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo', {layout: 'main'});
});

app.get("/addStudent", (req, res) => {
    res.render('addStudent', {layout: 'main'});
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body)
    .then(() => {
        res.redirect("/students");
    })
    .catch((error) => {
        console.log(error.message)
        res.status(400).send(`<script>alert('Something Went Wrong'); window.location.href = '/addStudent';</script>`);
    })
})

app.get("/students", (req, res) => {
    if (req.query && req.query.course) {
        collegeData.getStudentsByCourse(req.query.course)
        .then((students) => {
            res.render("students", {data: students});
        })
        .catch((err) => {
            console.log(err.message);
            res.render("students", {message: "No Results"});
        })
    }
    else {
        collegeData.getAllStudents()
        .then((students) => {
            res.render("students", {data: students});
        })
        .catch((err) => {
            console.log(err.message);
            res.render("students", {message: "No Results"});
        })
    }
});

app.get("/students/:num", (req, res) => {
    collegeData.getStudentByNum(req.params.num)
    .then((students) => {
        res.render("student", { data: students }); 
    })
    .catch((err) => {
        res.render("students", {message: "No Results"});
    })
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body)
    .then(() => {
        res.redirect("/students");
    })
    .catch((error) => {
        console.log(error);
        res.status(400).send(`<script>alert('Something Went Wrong');</script>`);
    })
});

app.get("/courses", (req, res) => {
    collegeData.getCourses()
    .then((courses) => {
        res.render("courses", {data: courses});
    })
    .catch((err) => {
        console.log(err.message);
        res.render("courses", {message: "No Results"});
    })
});

app.get("/course/:num", (req, res) => {
    collegeData.getCourseById(req.params.num)
    .then((course) => {
        res.render("course", { data: course }); 
    })
    .catch((err) => {
        res.render("course", {message: "No Results"});
    })
});

app.all('*',(req, res) => {
    res.status(404).json({message:"Page Not Found"});
});
// setup http server to listen on HTTP_PORT
collegeData.initialize()
.then ((students) => {
    console.log(`${students} loaded`)
    app.listen(HTTP_PORT, ()=>{console.log("server listening on port: " + HTTP_PORT)});
}).catch((err) => {
    console.log(err.message);
    console.log("Failed to fetch data from disk")
})

module.exports = app;
