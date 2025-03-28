var BASE_URL="https://todo-backend-43ux.onrender.com";

var AllUsers = [];
var isTaken;

function users() {

  $.ajax({
    method: "get",
    url: `${BASE_URL}/users`,
    success: (users) => {
      AllUsers = users;


    }
  })




}
users();

function LoadView(url, callback) {

  $.ajax({
    method: "get",
    url: url,
    success: (response) => {

      $("#con").html(response);
      $("#lblName").html($.cookie("username"));

      if (callback) {
        callback();
      }

    }

  })
}
$(document).on("click", "#btnCreateAccount", () => {
  $.cookie("pageName", `user-register.html`);
  LoadView($.cookie("pageName"), () => {
    $.cookie("view", "container");
    $("#con").attr("class", $.cookie("view"));
  });

})
$(document).on("click", "#btnCancel", () => {

  $.cookie("pageName", `home.html`);
  LoadView($.cookie("pageName"), () => {
    $.cookie("view", "container");
    $("#con").attr("class", $.cookie("view"));
  });

})
$(document).on("click", "#btnSignin", () => {


  $.cookie("pageName", `user-login.html`);
  const pagePath = decodeURIComponent($.cookie("pageName"));
  LoadView(pagePath, () => {
    $.cookie("view", "container");
    $("#con").attr("class", $.cookie("view"));
  });

})
$(document).on("click", "#btnRegister", () => {
  var user = {
    UserId: $("#UserId").val(),
    UserName: $("#UserName").val(),
    Password: $("#Password").val(),
    Email: $("#Email").val(),
    Mobile: $("#Mobile").val()
  }

  var missingFields = [];

  for (let [key, value] of Object.entries(user)) {
    if (value.trim() === "") {
      missingFields.push(key);
    }
  }

  if (missingFields.length > 0) {
    alert("The following fields are empty: " + missingFields.join(" ,"));
    console.log(missingFields);


  }
  else if (isTaken) {
    alert("Name Already Taken Try Different !")
  }
  else {
    $.ajax({

      method: "post",
      url: `${BASE_URL}/register-user`,
      data: user,
      success: () => {

        alert("Registered Successfully...");
        $.cookie("pageName", "user-login.html");
        LoadView($.cookie("pageName"), () => {
          $.cookie("view", "container");
          $("#con").attr("class", $.cookie("view"));
        });

      }
    })
  }
})






$(document).on("keyup", "#UserId", () => {
  var userid = $("#UserId").val().trim();

  if (AllUsers.length > 0) {
    isTaken = AllUsers.some((user) => user.UserId === userid);
    console.log(isTaken);
    if (userid == "") {
      $("#takenMsg").html("User Id Required").addClass("text-danger");
    }
    else if (isTaken) {
      $("#takenMsg").removeClass("text-success");
      $("#takenMsg").html("Name Already Taken").addClass("text-danger");
    } else {
      $("#takenMsg").removeClass("text-danger");
      $("#takenMsg").html("Available").addClass("text-success");
    }
  }
});


$(document).on("click", "#btnLogin", () => {



  var userid = $("#UserLId").val().trim();
  var password = $("#LPassword").val().trim();

  $.ajax({

    method: "get",
    url: `${BASE_URL}/users`,
    success: (users) => {




      var isUser = users.some((user) => {
        return user.UserId == userid

      });
      var isPassword = users.some((user) => {
        username = user.UserName;
        return user.Password == password;

      });





      if (!isPassword && !isUser) {
        alert("incorrect password and userid");
      }

      else if (!isPassword) {
        alert("password is incorrect");
      }
      else if (!isUser) {
        alert("userid is incorrect");
      }
      else {


        $("#main").addClass("blur");
        $.cookie("pageName", "dashboard.html");
        LoadView($.cookie("pageName"), () => {
          $.cookie("view", "dashboard-view");
          $("#con").attr("class", $.cookie("view"));
        });
        users.map((user) => {
          if (user.UserId == userid) {
            $.cookie("username", user.UserName);
            $.cookie("userid", userid);

            RenderAppointments(userid);

          }
        })



      }

    }
  })

})

$(document).on("click", "#addNewAppointment", () => {

  $("#txtAId").val("");
  $("#txtATitle").val("");
  $("#txtADes").val("");
  $("#error-msg").html("");
  $("#txtAId").prop("disabled", false);
  $('#modal').modal('show');
})

function RenderAppointments(userid) {

  $("#dashboard-body").html("");
  $.ajax({
    method: "get",
    url: `${BASE_URL}/get-appointments/${userid}`,
    success: (appointments) => {


      appointments.map((appointment) => {
        var date = new Date(appointment.Date);

        $(`<div class='card w-50 border border-2'  >  
              
               <div class = 'card-header'>
               <div>
               <span id='Atitle' class='fs-4 fw-bold'> ${appointment.Title}</span>
               </div>
                <div>
               <span id='Aid'> Appointment id : ${appointment.AppointmentId} </span>
               </div>
               </div>
               <div class='card-body'>
                   <div id='description' >
                    <p id='Ades'>${appointment.Description}</p>
                   </div>
                   <div id='dateTime'>
                    <div> <p id='Adate'>${date.toLocaleString()}</p></div>
                    <div> <button class='btn btn-warning bi bi-pen-fill me-1 mt-1 editBtn' id='${appointment.AppointmentId}' >Edit</button><button id='${appointment.AppointmentId}' class='btn btn-danger mt-1 bi bi-trash btnDelete'>Delete</button> </div>
                    
                   </div>

               </div>
              
              </div>`).appendTo($(`#dashboard-body`));


      })
    }
  })

}





$(document).on("click", "#saveAppointment", () => {
  var dateString = $("#txtADate").val();
  var [datePart, timePart] = dateString.split("T"); // Split date and time
  var [year, month, day] = datePart.split("-");
  var formattedDateString = `${year}-${month}-${day}T${timePart}`;
  console.log(formattedDateString);
  var appointment = {
    AppointmentId: $("#txtAId").val().trim(),
    Title: $("#txtATitle").val().trim(),
    Description: $("#txtADes").val().trim(),
    Date: new Date(formattedDateString),
    Time: new Date(formattedDateString),
    UserId: $.cookie("userid")

  }

  if (appointment.AppointmentId == "" || appointment.Title == "" || appointment.Description == "" | formattedDateString == "-undefined-undefinedTundefined") {
    alert(" Can't Add Please Fill All The Fields");
  }
  else {
    addAppointment(appointment);
  }


})

function addAppointment(appointment) {



  $.ajax({
    method: "post",
    url: `${BASE_URL}/add-appointment`,
    data: appointment,
    success: () => {
      alert("Appointment Added");
      RenderAppointments($.cookie("userid"));


    }

  })
}

$(document).on("click", "#btnLogout", () => {


  $("#main").removeClass("blur");

  $.removeCookie("userid");
  $.removeCookie("username");

  $.cookie("pageName", "home.html");
  LoadView($.cookie("pageName"), () => {
    $.cookie("view", "container");
    $("#con").attr("class", $.cookie("view"));
  });

})

$(document).on("keyup", "#txtAId", () => {
  var AId = $("#txtAId").val();

  var isTaken;
  $.ajax({
    method: "get",
    url: `${BASE_URL}/get-appointments/${$.cookie("userid")}`,
    success: (appointments) => {

      isTaken = appointments.some((appointment) => appointment.AppointmentId == AId);
      if (AId == "") {
        $("#error-msg").html("Appointment ID is required and it must be number...").css({ color: "red", fontSize: "14px" });
      }

      else if (isTaken) {
        $("#error-msg").html("Appointment Id Already Used...").css({ color: "red", fontSize: "14px" });

      }
      else {
        $("#error-msg").html("Available").css({ color: "green", fontSize: "14px" });
      }

    }
  })

})

$(document).on("click", ".editBtn", (e) => {
  $("#saveAppointment").css({ display: "none" });
  $("#saveEdit").css({ display: "block" });

  var id = e.target.id;
  console.log(id);
  $.ajax({
    method: "get",

    url: `${BASE_URL}/get-appointment/${$.cookie("userid")}/${id}`,
    success: (appointment) => {

      console.log(appointment);

      $("#txtAId").val(appointment.AppointmentId).prop("disabled", true);
      $("#txtATitle").val(appointment.Title);
      $("#txtADes").val(appointment.Description);
      $("#txtADate").val(appointment.Date);
      $("#modal").modal("show");

    }
  })


})

$(document).on("click", "#saveEdit", () => {

  console.log("save button is clickeeddd");

  var dateString = $("#txtADate").val();
  var [datePart, timePart] = dateString.split("T"); // Split date and time
  var [year, month, day] = datePart.split("-");
  var formattedDateString = `${year}-${month}-${day}T${timePart}`;
  console.log(formattedDateString);
  var appointment = {
    AppointmentId: $("#txtAId").val(),
    Title: $("#txtATitle").val(),
    Description: $("#txtADes").val(),
    Date: new Date(formattedDateString),
    Time: new Date(formattedDateString),
    UserId: $.cookie("userid")

  }
  console.log(appointment);

  if (appointment.AppointmentId == "" || appointment.Title == "" || appointment.Description == "" | formattedDateString == "-undefined-undefinedTundefined") {
    alert(" Can't Save Please Fill All The Fields");
  }
  else {

    $.ajax({
      method: "put",
      url: `${BASE_URL}/edit-appointment/${$.cookie("userid")}/${appointment.AppointmentId}`,
      data: appointment,
      success: () => {

        $("#saveAppointment").css({ display: "block" });
        $("#saveEdit").css({ display: "none" });
        $("#txtAId").prop("disabled", false);
        RenderAppointments(appointment.UserId);

      }
    })

  }



})

$(document).on("click", "#modalClose", () => {

  $("#txtAId").prop("disabled", false);
})


$(document).on("click",".btnDelete",(e)=>{
 console.log("clickeed delete");
 
 if( confirm("Are You Sure | You Want To Delete?"))
 {
  var id = e.target.id;
  $.ajax({
  
   method:"delete",
   url:`${BASE_URL}/delete-appointment/${$.cookie("userid")}/${id}`,
   success:()=>{
     alert("Apointment Deleted");
     RenderAppointments($.cookie("userid"));
 
   }
 
  })
 }

})



$(() => {
  
  if ($.cookie("FirstVisit") == undefined) {
    $.cookie("pageName", "home.html");
    $.cookie("FirstVisit", "false");
    LoadView($.cookie("pageName"), () => {
      $.cookie("view", "container");
      $("#con").attr("class", $.cookie("view"));
      console.log($("#con").hasClass("container"));
    });
  }
  else {
    LoadView($.cookie("pageName"), () => {
      $("#con").attr("class", $.cookie("view"));
    });
  }

  if($.cookie("pageName")=="dashboard.html"){
    RenderAppointments($.cookie("userid"));
  }


})






