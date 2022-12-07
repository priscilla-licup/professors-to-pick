require('dotenv').config();

const express = require('express');
const mysql = require('mysql');
const cors = require("cors");

const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require("express-session");

const fileUpload = require('express-fileupload');
const bcrypt = require('bcrypt');
const path = require('path');
const app = express();
app.set('trust proxy', 1);

app.use(fileUpload());
app.use(express.static(path.join(__dirname, '../')));
app.use(bodyParser.urlencoded({extended: true}));

app.set('views',path.join(__dirname, '../Views'));

global.globaluser={};

/* Session */
app.use(express.json());
app.use(
    cors({ 
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));

const MySQLStore = require("express-mysql-session")(session);

// var con = mysql.createConnection('mysql://root:kv83jKtBiNu1wkHwLBpt@containers-us-west-157.railway.app:7534/railway');

// Connection Pool
var con = mysql.createPool('mysql://root:kv83jKtBiNu1wkHwLBpt@containers-us-west-157.railway.app:7534/railway');

var sessionStore = new MySQLStore({
     createDatabaseTable: true,
     schema:{
         tableName: 'tblSession',
         columnNames: {
             session_id: 'session_id',
             data: 'data'
         }
     }
 },con)

app.use(session({
    key: 'key',
    secret: process.env.SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 60 * 60 * 24,
    }
}))


const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=>{
    console.log("Server is running at port: "+ PORT)
})

/* Check if logged in */
function isAuth(req, res, next){
    if(req.session.username){
        return next();
    }
    else{
        res.redirect('/');
    }
}

/* Check if logged in for register and login */
function checkAuth(req, res, next){
    if(req.session.username){
        res.redirect('/entry');
    }
    else{
        return next();
    }
}

/* End of Session */

app.get("/", checkAuth, function(req, res){
    var message = req.query.error;
    console.log(res.session);
    res.render("index.ejs", {
        msg: message
    });
});

app.get("/about", isAuth, function(req, res){
    res.render("about.ejs");
});

app.get("/add_prof", isAuth, function(req, res){
    var sql = "SELECT * FROM department";
    con.query(sql, (error, department, fields) => {
        if (error) throw error;
        else {
            sql = "SELECT * FROM subjects";
            con.query(sql, (error, subjects, fields) => {
                if (error) throw error;
                else {
                    sql = "SELECT * FROM school";
                    con.query(sql, (error, school, fields) => {
                        if (error) throw error;
                        else{
                            res.render("addProf.ejs", {
                                department: department,
                                subjects: subjects,
                                school: school,
                            });
                        }
                    });
                }
            });
        }
    });
});

app.get("/catalog", isAuth, function(req, res){
    res.render("catalog.ejs");
});

app.get("/edit", isAuth, function(req, res){
    var sql = "SELECT e.*, concat(p.firstname, ' ', p.lastname) as full_name FROM entry e left join professors p on e.professor_id=p.professor_id where entry_id=" + req.query.entryid;
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else {
            con.query(sql, (error, pic, fields)=>{
                if (error) throw error;
                else
                    res.render("editEntry.ejs", {
                        data: results[0],
                        userid: req.query.userid,
                        entryid: req.query.entryid,
                        profilePicture: pic[0]
                    });
            });
        }
    });
});

app.get("/edit_profile", isAuth, function(req, res){
    var sql = "SELECT * FROM user WHERE user_id=" + globaluser.user_id;
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else {
            sql = "SELECT * FROM school";
            con.query(sql, (error, school, fields) => {
                if (error) throw error;
                else {
                    
                    res.render("editProfile.ejs", {
                        results: results[0],
                        school: school,
                        user: req.query.user,
                        error: req.query.error
                    });
                }
            });
        }
    });
});


app.get("/entry", isAuth, function(req, res){
        res.render("entry.ejs");
});

app.get("/professor", isAuth, function(req, res){
    res.render("profProfile.ejs", {
        prof: req.query.profid
    });
});

app.get("/profile", isAuth, function(req, res){
    res.render("profile.ejs", {
        profile: req.query.profile
    });
})

app.get("/signup", checkAuth, function(req, res){
    var sql = "SELECT * FROM school";
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else res.render("signup.ejs", {
            results: results,
            msg: req.query.error
        });
    });

});

app.post("/create_account", checkAuth, function(req, res){
    if (req.body.password != req.body.repassword) {
        res.redirect("/signup?error=1");
    } else {
        var sql =   "INSERT INTO user(school_id,username, password, year_level, course, biography) VALUES(";
            sql +=  "'" + req.body.school + "'";
            sql +=  ", '" + req.body.username + "'";
            sql +=  ", '" + bcrypt.hashSync(req.body.password, 10) + "'";
            sql +=  ", '" + req.body.yearLevel + "'";
            sql +=  ", '" + req.body.course + "'";
            sql +=  ", '" + req.body.bio + "')";
        
        con.query(sql, (error, profile, fields) => {
            if (error) {
                res.redirect("/signup?error=2");
            } else {
                var profilePicture = "";
                if(req.files!=null){
                    const { myPhoto } = req.files;
                    profilePicture = 'u'+profile.insertId+'.' + myPhoto.name.split('.').pop();
                    myPhoto.mv(path.join(__dirname, '../pictures/'+profilePicture));
                    sql =   "UPDATE user ";
                    sql +=  "SET profile_picture='"+profilePicture+"' ";
                    sql +=  "WHERE user_id='"+profile.insertId+"'";
                    con.query(sql, (error, subjects, fields) => {
                        if (error) throw error;
                    });
                }
                res.redirect("/");
            }
        });
    }
});

app.post("/create_prof", isAuth, function(req, res){
    var sql = "INSERT INTO professors(school_id, department_id, firstname, lastname) VALUES('"
    sql += req.body.school + "', '" + req.body.department + "', '" + req.body.fname + "', '" + req.body.lname + "');";
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else {
            var profilePicture = "";
            if(req.files!=null){
                const { myPhoto } = req.files;
                profilePicture = 'p'+results.insertId+'.' + myPhoto.name.split('.').pop();
                myPhoto.mv(path.join(__dirname, '../pictures/'+profilePicture));
            }
            if(profilePicture!=""){
                sql="UPDATE professors SET profile_picture='"+profilePicture+"' WHERE professor_id='"+results.insertId+"'; ";
                con.query(sql, (error, subjects, fields) => {
                    if (error) throw error;
                });
            }

            sql = "INSERT INTO subject_professor_link VALUES ";
            for (var i = 0; i < req.body.subjects.length; i++) {
                if (i > 0)
                    sql += ", ";
                sql += "(" + results.insertId + ", " + req.body.subjects[i] + ")";
            }

            con.query(sql, (error, subjects, fields) => {
                if (error) throw error;
                else {
                    res.redirect("/catalog");
                }
            });
        }
    });
});

app.post("/deleteEntry", isAuth, function(req, res){
    var sql =   "DELETE "
        sql +=  "FROM entry "
        sql +=  "WHERE entry_id=" + req.body.entryID;
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else
            res.json({
                result: results
            });
    });
});

app.post("/fetch", isAuth, function(req, res){
    var sql =   "SELECT   u.username";
        sql +=  "        , CONCAT(p.firstname,' ', p.lastname) as full_name";
        sql +=  "        , p.professor_id";
        sql +=  "        , p.profile_picture";
        sql +=  "        , s.school";
        sql +=  "        , d.department";
        sql +=  "        , e.* ";
        sql +=  "        , IFNULL(v.vote, 0) as vote";
        sql +=  "        , IFNULL(uv.vote, 0) as user_vote ";
        sql +=  "FROM   entry e "
        sql +=  "       LEFT JOIN user u on e.user_id=u.user_id ";
        sql +=  "       LEFT JOIN professors p on p.professor_id=e.professor_id ";
        sql +=  "       LEFT JOIN school s on s.school_id=p.school_id ";
        sql +=  "       LEFT JOIN department d on d.department_id=p.department_id ";
        sql +=  "       LEFT JOIN (SELECT 	entry_id";
        sql +=  "                        , SUM(vote) as vote ";
        sql +=  "                       FROM vote ";
        sql +=  "                GROUP BY entry_id) v on v.entry_id=e.entry_id";
        sql +=  "       LEFT JOIN ( SELECT entry_id";
        sql +=  "				        , vote";
        sql +=  "                 FROM vote";
        sql +=  "                 WHERE user_id=" + globaluser.user_id + ") uv on uv.entry_id=e.entry_id ";
        sql +=  "ORDER BY e.entry_id desc";
    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else {
            res.json({
                result: results,
            });
        }
    });
});

app.post("/fetch_filter", isAuth, function(req, res){
    var sql = "SELECT school_id AS id, school AS val FROM school";
    con.query(sql, (error, school, fields) => {
        if (error) throw error;
        else {
            sql = "SELECT department_id AS id, department AS val FROM department";
            con.query(sql, (error, department, fields) => {
                if (error) throw error;
                else {
                    sql = "SELECT subjects_id AS id, subjects AS val FROM subjects";
                    con.query(sql, (error, subjects, fields) => {
                        if (error) throw error;
                        else {
                            res.json({
                                0: school,
                                1: department,
                                2: subjects
                            });
                        }
                    });
                }
            });
        }
    });
});

app.post("/fetch_profs", isAuth, function(req, res){
    var sql = "SELECT * FROM professors p RIGHT JOIN ";
    var sqls = "(SELECT DISTINCT(professor_id) FROM subject_professor_link WHERE 1=1"
    for (var i = 1; i <= req.body.subjects.length && req.body.subjects.length != 1; i++) {
        if (i == 1)
            sqls += " AND (subject_id=" + req.body.subjects[i];
        else if (i < req.body.subjects.length)
            sqls += " OR subject_id=" + req.body.subjects[i];
        else
            sqls += ") ";
    }
    sql += sqls + ") s ON s.professor_id = p.professor_id LEFT JOIN school sc ON sc.school_id = p.school_id LEFT JOIN department d ON d.department_id=p.department_id WHERE 1=1"

    for (var i = 1; i <= req.body.school.length && req.body.school.length != 1; i++) {
        if (i == 1)
            sql += " AND (p.school_id=" + req.body.school[i];
        else if (i < req.body.school.length)
            sql += " OR p.school_id=" + req.body.school[i];
        else
            sql += ")"
    }

    for (var i = 1; i <= req.body.department.length && req.body.department.length != 1; i++) {
        if (i == 1)
            sql += " AND (p.department_id =" + req.body.department[i];
        else if (i < req.body.department.length)
            sql += " OR p.department_id =" + req.body.department[i];
        else
            sql += ")";
    }
    sql += " AND CONCAT(p.firstname, ' ', p.lastname) LIKE '%" + req.body.text + "%'";

    con.query(sql, (error, professors, fields) => {
        if (error) throw error;
        else {
            res.json({
                profInfo: professors
            });
        }
    });
});

app.post("/insert_entry", isAuth, function(req, res){
    let today = new Date().toISOString().slice(0, 10)
    var sql =   "INSERT INTO Entry(";
        sql +=  "professor_id";
        sql +=  ", user_id";
        sql +=  ", entry_date";
        sql +=  ", content) VALUES (";
        sql +=  "  '" + req.query.profid + "'";
        sql +=  ", '" + req.query.userid + "'";
        sql +=  ", '" + today + "'";
        sql +=  ", '" + req.body.entry + "')";

    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else {
            res.json({
                message: results
            });
        }
    });
});

app.post("/login", checkAuth, function(req, res){

    var sql =   "SELECT * ";
         sql +=  "FROM   user ";
         sql +=  "WHERE  username='" + req.body.username+"'";

     con.query(sql, (error, results, fields) => {
         if (error) throw error;
         else if (results.length == 0) {
             var message = encodeURIComponent(2);
             res.redirect("/?error=" + message);
         } else {
             if(bcrypt.compareSync(req.body.password, results[0].password)){
                 globaluser = {
                     user_id: results[0].user_id,
                     picture: results[0].profile_picture
                 }
                 req.session.username = req.body.username;
                 console.log(req.session);
                 console.log("Login Successful!");
                 console.log("Welcome " + req.body.username + "!");
                 res.redirect("/entry");
             }else{
                 var message = encodeURIComponent(1);
                 res.redirect("/?error=" + message);
             }
            
         }
     });
});

app.post("/prof_header", isAuth, function(req, res){
    var sql = "SELECT  CONCAT(firstname, ' ', lastname) as full_name ";
        sql += "        ,school ";
        sql += "        ,department ";
        sql += "        ,p.* ";
        sql += "FROM professors p ";
        sql += "     LEFT JOIN school s ON s.school_id = p.school_id ";
        sql += "     LEFT JOIN department d ON d.department_id = p.department_id ";
        sql += "WHERE p.professor_id=" + req.query.profid;

    con.query(sql, (error, profinfo, fields) => {
        if (error) throw error;
        else {
            sql =   "SELECT  * ";
            sql +=  "FROM    subject_professor_link spl ";
            sql +=  "        LEFT JOIN subjects s ON s.subjects_id=spl.subject_id ";
            sql +=  "WHERE   professor_id=" + req.query.profid;

            con.query(sql, (error, subjects, fields) => {
                if (error) throw error;
                else {
                    res.json({
                        professorInfo: profinfo,
                        subjects: subjects,
                        users: req.query.user
                    });
                }
            });
        }
    });
});

app.post("/prof_fetch_entry", isAuth, function(req, res){
    var sql =   "SELECT e.* ";
        sql +=  "       ,username ";
        sql +=  "       ,u.profile_picture ";
        sql +=  "       ,Ifnull(v.vote, 0)  AS vote ";
        sql +=  "       ,Ifnull(uv.vote, 0) AS user_vote ";
        sql +=  "FROM   entry e ";
        sql +=  "       LEFT JOIN USER u ON e.user_id = u.user_id ";
        sql +=  "       LEFT JOIN (SELECT entry_id, ";
        sql +=  "                         Sum(vote) AS vote ";
        sql +=  "                  FROM   vote ";
        sql +=  "                  GROUP  BY entry_id) v ON v.entry_id = e.entry_id ";
        sql +=  "       LEFT JOIN (SELECT entry_id, ";
        sql +=  "                         vote ";
        sql +=  "                  FROM   vote ";
        sql +=  "                  WHERE  user_id = " + req.query.user + ") uv ON uv.entry_id = e.entry_id ";
        sql +=  "WHERE  professor_id = " + req.query.profid+" ";
        sql +=  "ORDER BY e.entry_id desc";
    con.query(sql, (error, entry, fields) => {
        if (error) throw error;
        else {
            res.json({
                entries: entry,
                users: req.query.user
            });
        }
    });
});
app.post("/profile_header", isAuth, function(req, res){
    var sql =   "SELECT * ";
        sql +=  "FROM    user u ";
        sql +=  "        LEFT JOIN school s ON s.school_id=u.school_id ";
        sql +=  "WHERE   user_id = " + req.body.id;

    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else
            res.json({
                user: req.body.user,
                profile: req.body.profile,
                results: results[0]
            });
    });
});

app.post("/profile_fetch_entry", isAuth, function(req, res){
    var sql =   "SELECT e.* ";
        sql +=  "       ,CONCAT(p.firstname, ' ', p.lastname) as username";
        sql +=  "       ,p.profile_picture ";
        sql +=  "       ,Ifnull(v.vote, 0)  AS vote ";
        sql +=  "       ,Ifnull(uv.vote, 0) AS user_vote ";
        sql +=  "FROM   entry e ";
        sql +=  "       LEFT JOIN professors p ON e.professor_id = p.professor_id ";
        sql +=  "       LEFT JOIN (SELECT entry_id, ";
        sql +=  "                         Sum(vote) AS vote ";
        sql +=  "                  FROM   vote ";
        sql +=  "                  GROUP  BY entry_id) v ON v.entry_id = e.entry_id ";
        sql +=  "       LEFT JOIN (SELECT entry_id, ";
        sql +=  "                         vote ";
        sql +=  "                  FROM   vote ";
        sql +=  "                  WHERE  user_id = " + req.query.user + ") uv ON uv.entry_id = e.entry_id ";
        sql +=  "WHERE  e.user_id = " + req.query.user + " ";
        sql +=  "ORDER BY e.entry_id desc";

    con.query(sql, (error, entry, fields) => {
        if (error) throw error;
        else {
            res.json({
                entries: entry
            });
        }
    });
});

app.post("/update", isAuth, function(req, res){
    if (req.query.load == 0) {
        var sql =   "UPDATE entry "
            sql +=  "SET content='" + req.body.editedPost + "' ";
            sql +=  "WHERE entry_id  = " + req.query.entryid;

        con.query(sql, (error, results, fields) => {
            if (error) throw error;
            else
                res.redirect("/entry");
        });
    }
});

app.post("/update_profile", isAuth, function(req, res){
    var profilePicture = "";
    if(req.files!=null){
        const { myPhoto } = req.files;
        profilePicture = 'u'+globaluser.user_id+'.' + myPhoto.name.split('.').pop();
        myPhoto.mv(path.join(__dirname, '../pictures/'+profilePicture));
        globaluser.picture=profilePicture;
    }
    
    var sql =   "UPDATE user SET ";
        sql +=  "username='"+req.body.username+"'";
        sql +=  ", school_id='"+req.body.school+"'";
        sql +=  ", year_level='"+req.body.year_level+"'";
        sql +=  ", course='"+req.body.course+"'";
        sql +=  ", biography='"+req.body.bio+"'";
        sql +=  ", password='"+req.body.password+"'";
        if(profilePicture!="")
            sql += ", profile_picture='"+ profilePicture +"'";
        sql +=  "WHERE user_id = '"+globaluser.user_id+"'";

        con.query(sql, (error, results, fields) => {
            if (error) {
                res.redirect("/edit_profile?error=1");
            } else
                res.redirect("/profile");
        });
});

app.post("/vote", isAuth, function(req, res){
    var sql =   "INSERT INTO vote VALUES(";
        sql +=   req.body.userID
        sql +=  ", " + req.body.entryID
        sql +=  ", " + req.body.vote + ") ";
        sql +=  "ON DUPLICATE KEY ";
        sql +=  "UPDATE vote=" + req.body.vote;

    con.query(sql, (error, results, fields) => {
        if (error) throw error;
        else
            res.json({
                result: results
            });
    });
});

app.get("/Logout", isAuth, function(req, res){
    req.session.destroy(function(err){
        if(!err){
            console.log("Logged Out!");
            res.redirect('/'); 
        }
    });
});


// app.listen('3000', () => {
//     console.log("Server start at port 3000");
// });