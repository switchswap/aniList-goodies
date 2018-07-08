"use strict";
function getPTWTime() {
    var temp  = document.getElementById("username").value;
    console.log(temp);
}

// Define the query
var query = `
query ($name: String) { # Define which variables will be used in the query (id)
  MediaListCollection(userName: $name, type: ANIME, status:PLANNING){ #name is variable. ANIME is hard coded
    lists {
      entries {
        media {
          id
          coverImage {
            medium
          }
          title {
            romaji
            english
            native
            userPreferred
          }
          episodes
          duration
        }
      }
    }
  }
}
`;

// Define our query variables and values that will be used in the query request
var variables = {
    name: ""
};


// Define the config we'll need for our Api request
var url = 'https://graphql.anilist.co',
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: ""
    };

// Make the HTTP Api request
function makeRequest(name){ //url,options
    document.getElementById("TimeBreakdown").innerHTML="";
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
    var PTW = data.data.MediaListCollection.lists[0].entries;
    var table = document.createElement("TABLE");
    //table.style.border = "thick solid #0000FF";
    var totalTime = 0;
    
    for(let i = 0; i<PTW.length;i++){
        var image = PTW[i].media.coverImage.medium,
            title = PTW[i].media.title.romaji,
            altTitle = PTW[i].media.title.userPreferred,
            duration = PTW[i].media.duration,
            episodes = PTW[i].media.episodes;
        if(episodes == null || duration == null){
            console.log(title);
            console.log(altTitle);
            console.log(episodes);
            console.log(duration);
        }
        else{
            var watchTime = duration*episodes;
            totalTime+=watchTime;
            table.appendChild(makeRow(image,title,altTitle,watchTime));
        }
    }
    
    document.getElementById("TimeBreakdown").appendChild(createTimeText(totalTime));
    document.getElementById("TimeBreakdown").appendChild(table);
}

function handleError(error) {
    alert('Error!');
    console.error(error);
}

function makeRow(i,t,aT,wT){ //image, title, altTitle, watchTime
    var row = document.createElement('tr');
    var img = new Image(),
        imgCol = row.insertCell(0),
        titleCol = row.insertCell(1),
        watchTimeCol = row.insertCell(2);
    
    //Parse Data
    img.src = i;
    var minutes = wT%60,
        hours = (wT - minutes)/60;
    
    //Populate Columns
    imgCol.appendChild(img);
    titleCol.innerHTML = (aT == null) ? t : aT;
    watchTimeCol.innerHTML = hours + "h " + minutes + "m";    
    return row;
}

function createTimeText(time){
    var minutes = time%60,
        hours = (time - minutes)/60;
    var text = document.createElement("h2");
    text.innerHTML = hours + " hours " + minutes + " minutes";
    return text;
}
