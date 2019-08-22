$(document).ready(function () {

  //pulisco il campo di testo
  $("#search-bar").val("marvel");

  //disabilito il pulsante per filtrare i generi
  $("#show-genres-select").addClass("hide");


  //chiave API
  var APIKEY = "122f548a0686e7e33947815fd89b1f76";
  //url ricerca film e serie TV
  var APIURL = "https://api.themoviedb.org/3/";

  //conservo la lista dei generi dopo averla recuperata dalla API
  //questo riduce il numero di API call
  var genresCache = [];
  var filteredGenresCache = [];

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
  var movieTemplate = Handlebars.compile($("#movie-template").html());
  var movieContext;

  var genreOptionTemplate = Handlebars.compile($("#genre-options-template").html());
  var genreOptionContext;


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
        if (data.results && data.results.length) {

          appendList(data.results);

        } else {
          //nascondo l'icona di caricamento
          $(".icon-cont").addClass("hide");
          $(".error-label").removeClass("hide");

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


      //nascondo l'icona di caricamento
      $(".icon-cont").addClass("hide");

      //aggiungo il film
      $("#movies-list").append(movieTemplate(movieContext));

      //aggiungo le stelline
      addStars(roundedScore, iteration.id);

    }

    //aggiungo gli attori
    appendActors()

    //attivo il bottone per filtrare i generi
    $("#show-genres-select").toggleClass("hide");


  }


  //restituisce l'array di generi in italiano
  function translateGenres(genresIDs) {
    var theGenre;
    var translatedArr = [];

    if (filteredGenresCache.length == 0) {
      removeGenresDupes()
    }

    //controllo che sia stato passat un array pieno E chei generi siano stati scaricati
    if (genresIDs && filteredGenresCache.length) {

      for (var i = 0; i < genresIDs.length; i++) {

        //trovo l'id corrispondente, confrontandolo con la lista di generi pertinente
        theGenre = filteredGenresCache.find(element =>
          element.id === genresIDs[i]
        ).name;

        if (theGenre) {
          translatedArr.push(theGenre)
        }
      }


    } else {
      translatedArr.push("Nessun genere trovato")

    }
    return translatedArr;
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

            if (castArr.length > 0) {
              jQueryContext.find(".actors-cont").text(castArr.join(", "));
            } else {
              console.log("nessun attore");
              jQueryContext.find(".actors-cont").text("Nessun attore trovato");
            }
          }
        },
        error: function (err) {
          console.log(err)
        }
      })



    });
  }

  //funzione per pulire la cache dei generi da duplicati
  function removeGenresDupes() {
    if (genresCache) {
      var lookup = {};

      for (var i = 0; i < genresCache.length; i++) {
        //se l'elemento non esiste in lookup...
        if (!lookup[genresCache[i].id]) {
          //...lo aggiungo così da poterlo confrontare successivamente...
          lookup[genresCache[i].id] = true;
          //...e lo aggiungo al mio array di elemtni unici
          filteredGenresCache.push(genresCache[i]);
        }
      }

      appendGenres();

    }
  }

  //funzione per aggiungere i generi nel DOM
  function appendGenres() {
    //controllo che ci siano generi nella cache
    if (filteredGenresCache) {
      for (var i = 0; i < filteredGenresCache.length; i++) {
        genreOptionContext = {
          genreOption: filteredGenresCache[i].name
        };
        $("#genre-form").prepend(genreOptionTemplate(genreOptionContext));
      }
    }
  }


  //funzione per filtrare i film per genere
  function filterGenres(array) {
    //conservo un array di generi
    var genresArr = [];
    var genresContent;
    var movieBox = $(".movie-box");

    for (var i = 0; i < array.length; i++) {
      genresArr.push(array[i].value);
    }

    //nascondo tutti gli elementi
    movieBox.addClass("hide");

    if (genresArr.length > 0) {

      movieBox.each(function () {

        //recupero i generi dal DOM
        genresContent = $(this).find(".genres-cont").text();

        for (var i = 0; i < genresArr.length; i++) {

          //se un elemento dell'array è presente, mostro l'elemento
          if (genresContent.includes(genresArr[i])) {
            $(this).removeClass("hide");
          }

        }

      });
    } else {
      //se non ci sono generi selezionati, mostro tutti gli elementi
      movieBox.removeClass("hide");
    }


  }

  //funzione per avviare la ricerca
  $("#search-form").submit(function () {
    event.preventDefault();
    if ($("#search-bar").val()) {
      //pulisco la lista esistente
      $("#movies-list").empty();
      $(".error-label").addClass("hide");
      $(".icon-cont").removeClass("hide");
      retrieveList($("#search-bar").val());
    }
  });

  //stessa funzione, ma con il tasto INVIO
  $("#search-bar").keydown(function () {

    if (event.which == 13) {
      console.log("invio");
      event.preventDefault();

      if ($("#search-bar").val()) {
        retrieveList($("#search-bar").val());
      }

    }

  });

  //funzione per mostrare la finestra di selezione generi da filtrare
  $("#show-genres-select").click(function () {

    $("#fullscreen-container").removeClass("hide");
  });

  //questa funzione chiude la finestra di selezione generi
  $("#container-filter-close").on("click", function () {
    $("#fullscreen-container").addClass("hide");
  });

  //lego il form alla funzione di filtraggio
  $("#genre-form").submit(function () {
    event.preventDefault();

    filterGenres($(this).serializeArray());
    //nascondo il form
    $("#fullscreen-container").addClass("hide");

  });

});