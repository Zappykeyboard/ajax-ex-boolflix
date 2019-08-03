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


  $("#button-search").on("click", function () {

    //prelevo il testo dalla search bar per la ricerca
    APIParams.query = $("#search-bar").val();

    $.ajax({
      url: APIURL,
      method: "GET",
      data: APIParams,
      success: function (data, status) {
        if (data.results){

          $("#movies-list").empty();

          resultsArr = data.results;

          //ciclo tra i risultati
          for (var i = 0; i < resultsArr.length; i++){
          movieContext = {
            title: resultsArr[i].title,
            originalTitle: resultsArr[i].original_title,
            language: resultsArr[i].original_language,
            ranking: resultsArr[i].vote_average
          }

          $("#movies-list").append(movieTemplate(movieContext));
        }

        }
      },
      error: function (err) {
        console.log(err)
      }

    })



  })





});