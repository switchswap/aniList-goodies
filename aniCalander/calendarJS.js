"use strict";

// Define the query
var query = `
query ($name: String) { # Define which variables will be used in the query (id)
  MediaListCollection(userName: $name, type: ANIME, forceSingleCompletedList: true){ #name is variable
    lists {
      name
      entries {
        media {
          siteUrl
          coverImage {
            medium
          }
          status
          title {
            romaji
          }
          nextAiringEpisode {
            airingAt
            timeUntilAiring
            episode
          }
        }
      }
    }
  }
}
`;

// Define the query variables and values that will be used in the query request
var variables = {
    name: ""
};


// Define the config for the Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: ""
    };

function parseEntry(entry) {
    var airDate = new Date(0);
    airDate.setUTCSeconds(entry.nextAiringEpisode.airingAt);

    var timeTillAir = new Date(0);
    timeTillAir.setUTCSeconds(entry.nextAiringEpisode.timeUntilAiring);

    var nextEpisode = entry.nextAiringEpisode.episode;

    var title = entry.title.romaji;

    console.log(title + " " + airDate + timeTillAir + nextEpisode);

    var section = document.getElementById(dateString(airDate.getDay()));

    var listItem = document.createElement("li");

    listItem.className = "list-group-item";
    console.log(entry.siteUrl);

    var seriesLink = document.createElement('a');
    seriesLink.setAttribute('href', entry.siteUrl);
    seriesLink.innerHTML = title;
    listItem.appendChild(seriesLink);

    var seriesInfo = document.createElement('p');
    seriesInfo.innerHTML = "Ep " + nextEpisode + " : " + airDate.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });
    listItem.appendChild(seriesInfo);

    section.appendChild(listItem);

}

// Make the HTTP Api request
function makeRequest(name) { //url,options
    variables.name = name;
    options.body = JSON.stringify({
        query: query,
        variables: variables
    })
    fetch(url, options)
        .then(handleResponse)
        .then(handleData)
        .catch(handleError);

}


function handleResponse(response) {
    return response.json().then(function (json) {
        return response.ok ? json : Promise.reject(json);
    });
}

function handleData(data) {
    var lists = data.data.MediaListCollection.lists;
    for (let x = 0; x < lists.length; x++) { //For each list
        var entries = lists[x].entries; //Each entry
        for (let y = 0; y < entries.length; y++) {
            if (entries[y].media.status == "RELEASING" && entries[y].media.nextAiringEpisode != null) {
                parseEntry(entries[y].media);
            }
        }
    }
    document.getElementById("entryPage").className = "user-entry d-none";
    document.getElementById("calendar").className = "shown";
}

function handleError(error) {
    //alert("Name not found");
    console.log(error);
    //    var err = error.errors[0].status;
    //    if (err = 500) {
    //        document.getElementById("usrname404").className = "alert alert-danger fade show";
    //    }
}

function onClick() {
    makeRequest(document.getElementById('usrname').value);
}

function closeAlert() {
    document.getElementById("usrname404").className = "alert alert-danger fade d-none";

}

function dateString(dayIndex) {
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
}
