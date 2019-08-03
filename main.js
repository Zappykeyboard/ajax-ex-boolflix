$(document).ready(function () {

  //url e chiave API
  var APIURL = "https://api.themoviedb.org/3/search/movie";
  var APIKEY = "122f548a0686e7e33947815fd89b1f76"

  //parametri url
  var APIParams = {
    api_key: APIKEY,
    language: "it"
  };

  //template handlebars
  var movieTemplate = Handlebars.compile($("#movie-template").html())
  var movieContext, resultsArr;


  // funzione per aggiungere le stelline  nell'html
  function addStars(score, id) {
    //aggiungo le stelline piene
    for (var i = 1; i <= score; i++) {
      $("ul[data-ID=" + id + "] .score-cont").append("<i class='fas fa-star'><i>");
    }
    //aggiungo le stelline vuote
    for (var i = 1; i <= (5 - score); i++){
      $("ul[data-ID=" + id + "] .score-cont").append("<i class='far fa-star'><i>");
    }

  }


  $("#button-search").on("click", function () {

    //prelevo il testo dalla search bar per la ricerca
    APIParams.query = $("#search-bar").val();

    $.ajax({
      url: APIURL,
      method: "GET",
      data: APIParams,
      success: function (data, status) {
        if (data.results) {

          $("#movies-list").empty();

          resultsArr = data.results;

          //ciclo tra i risultati
          for (var i = 0; i < resultsArr.length; i++) {
            var roundedScore = Math.ceil(resultsArr[i].vote_average / 2);

            //i valori da inserire nell'HTML
            movieContext = {
              title: resultsArr[i].title,
              originalTitle: resultsArr[i].original_title,
              language: resultsArr[i].original_language,
              itemID: resultsArr[i].id,
              ranking: roundedScore
            }

            //aggiungo il film
            $("#movies-list").append(movieTemplate(movieContext));
            //aggiungo le stelline
            addStars(roundedScore, resultsArr[i].id);
          }

        }
      },
      error: function (err) {
        console.log(err)
      }

    })



  })





});