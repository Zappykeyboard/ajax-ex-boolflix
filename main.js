$(document).ready(function () {

  //pulisco il campo di testo
  $("#search-bar").val("")

  //url e chiave API
  var APIURL = "https://api.themoviedb.org/3/search/multi";
  var APIKEY = "122f548a0686e7e33947815fd89b1f76"

  //parametri url
  var APIParams = {
    api_key: APIKEY,
    language: "it"
  };

  //template handlebars
  var movieTemplate = Handlebars.compile($("#movie-template").html())
  var movieContext, resultsArr;



  //funzione per ricevere la lista dalla API; 
  //accetta stringa; ritorna array
  function retrieveList(query) {

    APIParams.query = query;

    $.ajax({
      url: APIURL,
      method: "GET",
      data: APIParams,
      success: function (data, status) {
        if (data.results) {

          appendList(data.results);

        }
      },
      error: function (err) {
        console.log(err)
      }

    })

  }

  //funzione per inserire gli elementi html;
  //accetta array di oggetti
  function appendList(list) {
    var roundedScore, iteration;
    var posterBaseURL = "https://image.tmdb.org/t/p/w342/";
    


    //pulisco la lista esistente
    $("#movies-list").empty();


    for (var i = 0; i < list.length; i++) {

      iteration = list[i];

      //arrotondo il punteggio
      roundedScore = Math.ceil(iteration.vote_average / 2);

      //i valori da inserire nell'HTML
      movieContext = {
        title: function () {
          if (iteration.title) {
            return iteration.title;
          } else {
            return iteration.name;
          }
        },
        originalTitle: function () {
          if (iteration.original_title) {
            return iteration.original_title;
          } else {
            return iteration.original_name
          }
        },
        language: iteration.original_language,
        itemID: iteration.id,
        ranking: roundedScore,
        //TODO: aggiungere caso in cui iteration.poster_path === null
        imgURL: function(){
          if(iteration.poster_path){
           return posterBaseURL + iteration.poster_path
          } else return "img/coming_soon_poster.jpg" 
          
        } 
      }



      //aggiungo il film
      $("#movies-list").append(movieTemplate(movieContext));

      //aggiungo le stelline
      addStars(roundedScore, iteration.id);
    }

  }

  // funzione per aggiungere le stelline  nell'html
  function addStars(score, id) {
    //aggiungo le stelline piene
    for (var i = 1; i <= score; i++) {
      $("ul[data-ID=" + id + "] .score-cont").append("<i class='fas fa-star'><i>");
    }
    //aggiungo le stelline vuote
    for (var i = 1; i <= (5 - score); i++) {
      $("ul[data-ID=" + id + "] .score-cont").append("<i class='far fa-star'><i>");
    }

  }


  //funzione per avviare la ricerca
  $("#button-search").on("click", function () {

    if ($("#search-bar").val()) {
      retrieveList($("#search-bar").val());
    }
  });

  //stessa funzione, ma con il tasto INVIO
  $("#search-bar").keydown(function(){

    if (event.which == 13){

      event.preventDefault();

      if ($("#search-bar").val()) {
        retrieveList($("#search-bar").val());
      }

    }

  });


});