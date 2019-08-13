$(document).ready(function () {

  //pulisco il campo di testo
  $("#search-bar").val("marvel");

  //chiave API
  var APIKEY = "122f548a0686e7e33947815fd89b1f76";
  //url ricerca film e serie TV
  var APIURL = "https://api.themoviedb.org/3/";

  //conservo la lista dei generi dopo averla recuperata dalla API
  //questo riduce il numero di API call
  var genresCache = [];

  //parametri url
  var APIParams = {
    api_key: APIKEY,
    language: "it",
  };
  var queryParams = {};

  //recupero i generi immediatamente, da momento che presumibilmente non cambiano molto spesso
  (function () {

    $.ajax({
      url: APIURL + "genre/movie/list",
      method: "GET",
      data: APIParams,
      success: function (data) {

        if (data.genres) {
          for (var i = 0; i < data.genres.length; i++) {
            genresCache.push(data.genres[i]);
          }
          console.log(genresCache);
        }
      },
      error: function (err) {
        console.log(err)
      }

    });


    $.ajax({
      url: APIURL + "genre/tv/list",
      method: "GET",
      data: APIParams,
      success: function (data) {

        if (data.genres) {
          for (var i = 0; i < data.genres.length; i++) {
            genresCache.push(data.genres[i]);
          } console.log(genresCache)
        }
      },
      error: function (err) {
        console.log(err)
      }

    });


  })();

  //template handlebars
  var movieTemplate = Handlebars.compile($("#movie-template").html())
  var movieContext, resultsArr;



  //funzione per ricevere la lista dalla API; 
  //accetta stringa; ritorna array
  function retrieveList(queryStr) {

    queryParams.query = queryStr;
    $.extend(queryParams, APIParams);

    $.ajax({
      url: APIURL + "search/multi",
      method: "GET",
      data: queryParams,
      success: function (data) {
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
    var roundedScore, genres, iteration;
    var posterBaseURL = "https://image.tmdb.org/t/p/w342/";

    //pulisco la lista esistente
    $("#movies-list").empty();


    for (var i = 0; i < list.length; i++) {

      iteration = list[i];

      //arrotondo il punteggio
      roundedScore = Math.ceil(iteration.vote_average / 2);


      genres = translateGenres(iteration.genre_ids);
      console.log(genres);


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
        imgURL: function () {
          if (iteration.poster_path) {
            return posterBaseURL + iteration.poster_path
          } else return "img/coming_soon_poster.jpg"
        },
        genres: genres.join(", "),
        mediaType: iteration.media_type
      }



      //aggiungo il film
      $("#movies-list").append(movieTemplate(movieContext));

      //aggiungo le stelline
      addStars(roundedScore, iteration.id);

    }

    //aggiungo gli attori
    appendActors()
  }


  //restituisce l'array di generi in italiano
  function translateGenres(genresIDs) {
    var theGenre;
    var translatedArr = [];


    if (genresIDs && genresCache) {

      for (var i = 0; i < genresIDs.length; i++) {

        //trovo l'id corrispondente, confrontandolo con la lista di generi pertinente
        theGenre = genresCache.find(element =>
          element.id === genresIDs[i]
        ).name;

        if (theGenre) {
          translatedArr.push(theGenre)
        }
      }

      return translatedArr;
    } else {
      translatedArr.push("Nessun genere trovato")
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

  //recupero i primi 5 attori di ogni elemento, e li appendo
  function appendActors() {
    var mediaID, mediaType, searchURL;



    $(".movie-info").each(function () {

      var jQueryContext = $(this);

      // ID e tipo di media dell'oggetto
      mediaID = jQueryContext.attr("data-ID");
      mediaType = jQueryContext.attr("data-media");

      //compongo l'url
      searchURL = APIURL + mediaType + "/" + mediaID + "/credits";

      //uso il tipo di media e l'ID per trovare i credits
      $.ajax({
        url: searchURL,
        method: "GET",
        data: APIParams,
        success: function (data) {

          if (data.cast) {

            //riduco a 5  gli elementi
            data.cast.splice(5);

            var castArr = [];

            for (var i = 0; i < data.cast.length; i++) {
              //inserisco i nomi degli attori
              castArr.push(data.cast[i].name);
            }

            jQueryContext.find(".actors-cont").text(castArr.join(", "));
          }
        },
        error: function (err) {
          console.log(err)
        }
      })



    });
  }

  //funzione per avviare la ricerca
  $("#button-search").on("click", function () {

    if ($("#search-bar").val()) {
      retrieveList($("#search-bar").val());
    }
  });

  //stessa funzione, ma con il tasto INVIO
  $("#search-bar").keydown(function () {

    if (event.which == 13) {

      event.preventDefault();

      if ($("#search-bar").val()) {
        retrieveList($("#search-bar").val());
      }

    }

  });


});