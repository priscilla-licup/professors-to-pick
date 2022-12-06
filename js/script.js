function load_data(params) {
    if (params.load == 0) {
        $.ajax({
            url: "/fetch",
            method: "POST",
            data: {},
            dataType: "JSON",
            success: (data) => {
                var entry = "<div class='pt-1'></div>";
                if (!data.result.length) {
                    entry += "<h3 class='pt-5 text-center'>No Entries</h2>"
                } else {
                    for (var i = 0; i < data.result.length; i++) {
                        entry += "<div class='entry mt-5' id='" + data.result[i].entry_id + "'>";
                        entry += "   <div class='entry-prof'>";
                        entry += "       <img src='"+(data.result[i].profile_picture==null?'../assets/default.jpg':'../pictures/'+data.result[i].profile_picture)+"' class='entry-prof-img'>";
                        entry += "       <h3>" + data.result[i].full_name + "</h2>";
                        entry += "       <h5>" + data.result[i].school + "</h5>";
                        entry += "   </div>";
                        entry += "   <div class='entry-summary'>";
                        entry += "       <a class='link-dark' href='/profile?profile=" + data.result[i].user_id + "'>" + data.result[i].username + "</a>";
                        entry += "       <p class='entry-summary-date'>" + new Date(data.result[i].entry_date).toDateString(); + "</p>";
                        entry += "       <p class='entry-summary-content'>" + data.result[i].content + "<p>";
                        entry += "   </div>";
                        entry += "   <div class='entry-menus'>";
                        entry += "       <div class='entry-buttons'>";
                        entry += "           <a onclick='menuPopUp(this)'><i class='fa-solid fa-bars entry-menu'></i></a>";
                        entry += "           <div class='entry-burger hidden'>";
                        entry += "               <div class='card bg-dark text-white'>";
                        entry += "                   <ul class='list-group list-group-flush'>";
                        entry += "                           <li class='list-group-item list-group-transparent'><a class='link-white' href='/professor?profid=" + data.result[i].professor_id + "&entryid=" + data.result[i].entry_id + "'><i class='popup-icon fa-solid fa-eye'></i>View Post</a></li>";
                        if (data.result[i].user_id == params.userID) {
                            entry += "                           <li class='list-group-item list-group-transparent'><a class='link-white' href='/edit?entryid=" + data.result[i].entry_id + "'><i class='popup-icon fa-solid fa-pen-to-square'></i>Edit Post</a></li>";
                            entry += "                           <li class='list-group-item list-group-transparent'><a class='link-white' href='#' onclick='deleteEntry({entryID: " + data.result[i].entry_id + ", load: 0});'><i class='popup-icon fa-solid fa-delete-left'></i>Delete Post</a></li>";
                        }
                        entry += "                   </ul>";
                        entry += "               </div>";
                        entry += "           </div>";
                        entry += "           <div class='entry-vote'>";
                        entry += "               <p class='vote " + (data.result[i].vote > 0 ? "positive" : !data.result[i].vote ? "zero" : "negative") + "'>" + data.result[i].vote + "</p>";
                        entry += "               <a onclick='upVote(this, {userID: " + params.userID + ", entryID: " + data.result[i].entry_id + ", load: 0})'><i class='fa-solid fa-chevron-up up-vote " + (data.result[i].user_vote > 0 ? "up-vote-select" : "") + "'></i></a>";
                        entry += "               <a onclick='downVote(this, {userID: " + params.userID + ", entryID: " + data.result[i].entry_id + ", load: 0})'><i class='fa-solid fa-chevron-down down-vote " + (data.result[i].user_vote < 0 ? "down-vote-select" : "") + "'></i></a>";
                        entry += "           </div>";
                        entry += "       </div>";
                        entry += "   </div>";
                        entry += "</div>";
                    }
                }
                $(".container").html(entry);
            }
        });
    } else if (params.load == 1) {
        $.ajax({
            url: "/prof_header?user=" + params.userID + "&profid=" + params.profID,
            method: "POST",
            data: {},
            dataType: "JSON",
            success: (data) => {
                if(data.professorInfo[0].profile_picture!=null)
                $("#profImage").attr("src", "../pictures/"+data.professorInfo[0].profile_picture);
                $("#name").html(data.professorInfo[0].full_name);
                $("#school").html("School: "+ data.professorInfo[0].school);
                $("#department").html("Department: " + data.professorInfo[0].department);
                var html = "<p class='d-inline profile-main color-white'>Subject/s: </p>";
                for (var i = 0; i < data.subjects.length; i++) {
                    if (!i)
                        html += "<p class='d-inline profile-main color-white'>" + data.subjects[0].subjects + "</p>";
                    else
                        html += "<p class='d-inline profile-main color-white'>, " + data.subjects[0].subjects + "</p>";
                }
                $("#subjects").html(html);
                load_data({
                    userID: params.userID,
                    profID: params.profID,
                    load: 2
                });
            }
        });
    } else if (params.load == 2) {
        $.ajax({
            url: "/prof_fetch_entry?user=" + params.userID + "&profid=" + params.profID,
            method: "POST",
            data: {},
            dataType: "JSON",
            success: (data) => {
                var html = "";
                if (!data.entries.length) {
                    html += "<hr><h3 class='pt-5 text-center'>No Entries</h2>"
                }
                for (var i = 0; i < data.entries.length; i++) {
                    html += "<div class='row' id='" + data.entries[i].entry_id + "'>";
                    html += "   <div class='col'>";
                    html += "       <div class='card m-2'>";
                    html += "           <div class='card-header bg-nav text-white d-flex align-items-center '>";
                    html += "               <img class='nav-profile' src='"+(data.entries[i].profile_picture==null?'../assets/default.jpg':'../pictures/'+data.entries[i].profile_picture)+"'>";
                    html += "               <div class='m-0 ps-3 card-title'>";
                    html += "                   <a class='text-white' href='/profile?user=" + params.userID + "&profile=" + data.entries[i].user_id + "'>" + data.entries[i].username + "</a>";
                    html += "               </div>";
                    if (data.entries[i].user_id == params.userID) {
                        html += "               <div class='ms-auto'>";
                        html += "                   <a onclick='menuPopUp(this)'><i class='fa-solid fa-bars entry-menu'></i></a>";
                        html += "                   <div class='entry-burger hidden'>";
                        html += "                       <div class='card bg-dark text-white'>";
                        html += "                           <ul class='list-group list-group-flush'>";
                        html += "                               <li class='list-group-item list-group-transparent'><a class='link-white' href='/edit?entryid=" + data.entries[i].entry_id + "'><i class='popup-icon fa-solid fa-pen-to-square'></i>Edit Post</a></li>";
                        html += "                               <li class='list-group-item list-group-transparent'><a class='link-white' href='#' onclick='deleteEntry({entryID: " + data.entries[i].entry_id + ", userID: " + params.userID + ", profID: " + params.profID + ", load: 2});'><i class='popup-icon fa-solid fa-delete-left'></i>Delete Post</a></li>";
                        html += "                           </ul>";
                        html += "                       </div>";
                        html += "                   </div>";
                        html += "               </div>";
                    }
                    html += "           </div>";
                    html += "           <div id='3' class='card-body'>";
                    html += "               <p>" + data.entries[i].content + "</p>";
                    html += "           </div>";
                    html += "           <div class='card-footer d-flex'>";
                    html += "               <div class='ms-auto'>";
                    html += "                   <p class='vote " + (data.entries[i].vote > 0 ? "positive" : !data.entries[i].vote ? "zero" : "negative") + "'>" + data.entries[i].vote + "</p>";
                    html += "                   <a onclick='upVote(this, {userID: " + params.userID + ", entryID: " + data.entries[i].entry_id + ", profID: " + params.profID + ", load: 2})'><i class='fa-solid fa-chevron-up up-vote " + (data.entries[i].user_vote > 0 ? "up-vote-select" : "") + "'></i></a>";
                    html += "                   <a onclick='downVote(this, {userID: " + params.userID + ", entryID: " + data.entries[i].entry_id + ", profID: " + params.profID + ", load: 2})'><i class='fa-solid fa-chevron-down down-vote " + (data.entries[i].user_vote < 0 ? "down-vote-select" : "") + "'></i></a>";
                    html += "               </div>";
                    html += "           </div>";
                    html += "       </div>";
                    html += "   </div>";
                    html += "</div>";
                }
                $("#reviews").html(html);
            }
        });
    } else if (params.load == 3) {
        $.ajax({
            url: "/fetch_filter",
            method: "POST",
            data: {},
            dataType: "JSON",
            success: (data) => {
                var html = "";
                for (var i = 0; i < 3; i++) {
                    var section = ['School', 'Department', 'Subjects'];
                    html += "<div class='accordion-item'>";
                    html += "   <h2 class='accordion-header' id='panelsStayOpen-heading" + i + "'>";
                    html += "       <button class='accordion-button' type='button' data-bs-toggle='collapse' data-bs-target='#panelsStayOpen-collapse" + i + "'>";
                    html += section[i];
                    html += "       </button>";
                    html += "   </h2>";
                    for (var j = 0; j < data[i].length; j++) {
                        html += "        <div id='panelsStayOpen-collapse" + i + "' class='accordion-collapse collapse" + (i == 0 ? " show" : "") + "'>";
                        html += "            <div class='accordion-body'>";
                        html += "                <div class='form-check'>";
                        html += "                    <input class='form-check-input' onchange='load_data({load: 4})'type='checkbox' value='" + data[i][j].id + "' name='" + section[i] + "' id='flexCheckDefault'>";
                        html += "                    <label class='form-check-label' for='flexCheckDefault'>";
                        html += data[i][j].val;
                        html += "                    </label>";
                        html += "                </div>";
                        html += "            </div>";
                        html += "        </div>";
                    }
                    html += "    </div>";

                }
                $(".filter-area").append(html);
            }
        });
    } else if (params.load == 4) {
        var x = document.querySelectorAll("[name='School']:checked");
        var school = [-1],
            department = [-1],
            subjects = [-1];
        for (var i = 0; i < x.length; i++)
            school.push(x[i].value);
        x = document.querySelectorAll("[name='Department']:checked");
        for (var i = 0; i < x.length; i++)
            department.push(x[i].value);
        x = document.querySelectorAll("[name='Subjects']:checked");
        for (var i = 0; i < x.length; i++)
            subjects.push(x[i].value);
        var query = $("#search").serializeArray()[0].value;
        $.ajax({
            url: "/fetch_profs",
            method: "POST",
            data: {
                school: school,
                department: department,
                subjects: subjects,
                text: query
            },
            dataType: "JSON",
            success: (data) => {
                var html = "";
                if (typeof data.profInfo !== undefined) {
                    for (var i = 0; i < data.profInfo.length; i++) {
                        html += "<div class='col'>";
                        html += "    <a href='/professor?profid=" + data.profInfo[i].professor_id + "' class='link-dark text-decoration-none'>";
                        html += "        <div class='card h-100 text-center'>";
                        html += "            <div class='card-header'>";
                        html += "                <img src='"+(data.profInfo[i].profile_picture==null?'../assets/default.jpg':'../pictures/'+data.profInfo[i].profile_picture)+"' class='card-img-top'>";
                        html += "                <h5 class='mt-2 card-title'>" + data.profInfo[i].firstname + " " + data.profInfo[i].lastname + "</h5>";
                        html += "            </div>";
                        html += "            ";
                        html += "            <div class='card-body'>";
                        html += "                <p class='card-text'>" + data.profInfo[i].school + "</p>";
                        html += "                <p class='card-text'>" + data.profInfo[i].department + "</p>";
                        html += "            </div>";
                        html += "        </div>";
                        html += "    </a>";
                        html += "</div>";
                    }
                }
                $("#Professors").html(html);
            }
        });
    } else if (params.load == 5) {
        $.ajax({
            url: "/profile_header",
            method: "POST",
            data: {
                id: params.id
            },
            dataType: "JSON",
            success: (data) => {
                if(data.results.profile_picture!=null)
                    $("#uploadPreview").attr("src", "../pictures/"+data.results.profile_picture);
                $("#name").html(data.results.username);
                $("#school").html("School: " + data.results.school);
                $("#course").html("Course: " + data.results.course);
                $("#bio").html("Bio: " + data.results.biography)
                $("#year").html("Year-Level: " + data.results.year_level);
                load_data({
                    userID: params.id,
                    user: params.user,
                    load: 6
                });
            }
        });
    } else if (params.load == 6) {
        $.ajax({
            url: "/profile_fetch_entry?user=" + params.userID,
            method: "POST",
            data: {},
            dataType: "JSON",
            success: (data) => {
                var html = "";
                if (!data.entries.length) {
                    html += "<hr><h3 class='pt-5 text-center'>No Entries</h2>"
                }
                for (var i = 0; i < data.entries.length; i++) {
                    html += "<div class='row' id='" + data.entries[i].entry_id + "'>";
                    html += "   <div class='col'>";
                    html += "       <div class='card m-2'>";
                    html += "           <div class='card-header bg-nav text-white d-flex align-items-center '>";
                    html += "               <img class='nav-profile' src='"+(data.entries[i].profile_picture==null?'../assets/default.jpg':'../pictures/'+data.entries[i].profile_picture)+"'>";
                    html += "               <div class='m-0 ps-3 card-title'>";
                    html += "                   <p class='text-white'>" + data.entries[i].username + "</p>";
                    html += "               </div>";
                    if (params.user == params.userID) {
                        html += "               <div class='ms-auto'>";
                        html += "                   <a onclick='menuPopUp(this)'><i class='fa-solid fa-bars entry-menu'></i></a>";
                        html += "                   <div class='entry-burger hidden'>";
                        html += "                       <div class='card bg-dark text-white'>";
                        html += "                           <ul class='list-group list-group-flush'>";
                        html += "                               <li class='list-group-item list-group-transparent'><a class='link-white' href='/edit?entryid=" + data.entries[i].entry_id + "'><i class='popup-icon fa-solid fa-pen-to-square'></i>Edit Post</a></li>";
                        html += "                               <li class='list-group-item list-group-transparent'><a class='link-white' href='#' onclick='deleteEntry({entryID: " + data.entries[i].entry_id + ", userID: " + params.userID + ", load: 1});'><i class='popup-icon fa-solid fa-delete-left'></i>Delete Post</a></li>";
                        html += "                           </ul>";
                        html += "                       </div>";
                        html += "                   </div>";
                        html += "               </div>";
                    }
                    html += "           </div>";
                    html += "           <div id='3' class='card-body'>";
                    html += "               <p>" + data.entries[i].content + "</p>";
                    html += "           </div>";
                    html += "           <div class='card-footer d-flex'>";
                    html += "               <div class='ms-auto'>";
                    html += "                   <p class='vote " + (data.entries[i].vote > 0 ? "positive" : !data.entries[i].vote ? "zero" : "negative") + "'>" + data.entries[i].vote + "</p>";
                    html += "                   <a onclick='upVote(this, {userID: " + params.userID + ", user: " + params.user + ", entryID: " + data.entries[i].entry_id + ", load: 1})'><i class='fa-solid fa-chevron-up up-vote " + (data.entries[i].user_vote > 0 ? "up-vote-select" : "") + "'></i></a>";
                    html += "                   <a onclick='downVote(this, {userID: " + params.userID + ", user: " + params.user + ", entryID: " + data.entries[i].entry_id + ", load: 1})'><i class='fa-solid fa-chevron-down down-vote " + (data.entries[i].user_vote < 0 ? "down-vote-select" : "") + "'></i></a>";
                    html += "               </div>";
                    html += "           </div>";
                    html += "       </div>";
                    html += "   </div>";
                    html += "</div>";
                }
                $("#reviews").html(html);
            }
        });
    }
}

function deleteEntry(params) {
    if (params.load == 0) {
        $.ajax({
            url: "/deleteEntry",
            method: "POST",
            data: {
                entryID: params.entryID
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    load: 0
                });
            }
        });
    } else if (params.load == 1) {
        $.ajax({
            url: "/deleteEntry",
            method: "POST",
            data: {
                entryID: params.entryID
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    load: 6
                });
            }
        });
    } else if (params.load == 2) {
        $.ajax({
            url: "/deleteEntry",
            method: "POST",
            data: {
                entryID: params.entryID
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    profID: params.profID,
                    load: 2
                });
            }
        });
    }
}

function insertEntry(userID, profID) {
    $.ajax({
        url: "/insert_entry?userid=" + userID + "&profid=" + profID,
        method: "POST",
        data: $("#comment").serialize(),
        dataType: "JSON",
        success: (data) => {
            load_data({
                userID,
                profID,
                load: 2
            })
        }
    });
}

function menuPopUp(elem) {
    var elems = elem.parentElement.querySelector(".entry-burger");
    var jelem = $(elems);
    $(elems).removeClass("hidden");
    $(elem).attr("onclick", "menuRemove(this)");
    $(elem.querySelector(".entry-menu")).addClass("entry-menu-select");
}

function menuRemove(elem) {
    var elems = elem.parentElement.querySelector(".entry-burger");
    var jelem = $(elems);
    $(elems).addClass("hidden");
    $(elem).attr("onclick", "menuPopUp(this)");
    $(elem.querySelector(".entry-menu")).removeClass("entry-menu-select");
}

function upVote(elem, params) {
    var parent = elem.parentElement;
    var up = parent.querySelector(".up-vote");
    if (params.load == 0) {
        if ($(up).hasClass("up-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        load: 0
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: 1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    load: 0
                });
            }
        });
    } else if (params.load == 1) {
        if ($(up).hasClass("up-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        user: params.user,
                        load: 6
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: 1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    user: params.user,
                    load: 6
                });
            }
        });
    } else if (params.load == 2) {
        if ($(up).hasClass("up-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        profID: params.profID,
                        load: 2
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: 1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    profID: params.profID,
                    load: 2
                });
            }
        });
    }

}

function downVote(elem, params) {
    var parent = elem.parentElement;
    var down = parent.querySelector(".down-vote");
    if (params.load == 0) {
        if ($(down).hasClass("down-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        load: 0
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: -1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    load: 0
                });
            }
        });
    } else if (params.load == 1) {
        if ($(down).hasClass("down-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        user: params.user,
                        load: 6
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: -1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    user: params.user,
                    load: 6
                });
            }
        });
    } else if (params.load == 2) {
        if ($(down).hasClass("down-vote-select")) {
            $.ajax({
                url: "/vote",
                method: "POST",
                data: {
                    entryID: params.entryID,
                    userID: params.userID,
                    vote: 0
                },
                dataType: "JSON",
                success: (results) => {
                    load_data({
                        userID: params.userID,
                        profID: params.profID,
                        load: 2
                    });
                }
            });
            return;
        }
        $.ajax({
            url: "/vote",
            method: "POST",
            data: {
                entryID: params.entryID,
                userID: params.userID,
                vote: -1
            },
            dataType: "JSON",
            success: (results) => {
                load_data({
                    userID: params.userID,
                    profID: params.profID,
                    load: 2
                });
            }
        });
    }

}

function posneg(elem) {
    if (parseInt($(elem).text()) < 0) {
        $(elem).removeClass();
        $(elem).addClass("vote");
        $(elem).addClass("negative");

        return;
    }
    if (parseInt($(elem).text()) > 0) {
        $(elem).removeClass();
        $(elem).addClass("vote");
        $(elem).addClass("positive");

        return;
    }
    $(elem).removeClass();
    $(elem).addClass("vote");
    $(elem).addClass("zero");

    return;
}

function imagePreview() {
    var oFReader = new FileReader();
    oFReader.readAsDataURL(document.getElementById("uploadImage").files[0]);
    oFReader.onload = function(oFREvent) {
        document.getElementById("uploadPreview").src = oFREvent.target.result;
    };   
}