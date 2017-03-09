/*Function for AJAX requests*/
function AJAX(method, link, data, callback){
    var req = new XMLHttpRequest();
    req.open(method, link, true);
    if (method === 'POST')
        req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load', function(){
        if (req.status >= 200 && req.status < 400){
            callback(req.responseText);
        }
        else{
            console.log("Error: " + request.statusText);
        }
    });
    req.send(data);
} 


function getHistory() {

    history2 = $("#url_history2 option:selected").text();

    if (history2 !== "")
    {

        historyList = history2.split(" | ");


        urlHist = historyList[0].split("URL: ")[1];
        searchTermHist = historyList[1].split("Search Term: ")[1];
        levelsHist = historyList[2].split("Levels: ")[1];
        crawlTypeHist = historyList[3].split("Crawl Type: ")[1];
        visualTypeHist = historyList[4].split("Visualization: ")[1];

        if (crawlTypeHist == "Depth-First")
        {
            crawlTypeHist = '0';
        }

        else if (crawlTypeHist == "Breadth-First")
        {
            crawlTypeHist = '1';
        }

        if (visualTypeHist == "Graph")
        {
            visualTypeHist = '0';
        }

        else if (visualTypeHist == "Circle Packing")
        {
            visualTypeHist = '1';
        }

        document.getElementsByName('url')[0].value = urlHist;
        document.getElementsByName('search_term')[0].value = searchTermHist;
        document.getElementsByName('levels')[0].value = levelsHist;
        document.getElementsByName('crawl_type')[0].value = crawlTypeHist;
        document.getElementsByName('visual_type')[0].value = visualTypeHist;

    }

    else
    {
        resetForm();
    }
    

}


/*Resets the form elements*/
function resetForm(){
    document.getElementsByName('url')[0].value = '';
    document.getElementsByName('search_term')[0].value = '';
    document.getElementsByName('levels')[0].value = '';
    document.getElementsByName('crawl_type')[0].value = '0';
    document.getElementsByName('visual_type')[0].value = '0';
}


function resetHistory(){

    var data = {};
    data.action = 'reset';
    data = JSON.stringify(data);

    AJAX('POST', '/', data, function(response){
             
        });
}



var resetBtn = document.getElementById('resetSubmit');

if (resetBtn)
{
    resetBtn.addEventListener('click', function(e){
        e.preventDefault();
        $("#user_history").remove();
        resetHistory();
        resetForm();
    
    });
}

var usrHist = document.getElementById('user_history');

if (usrHist)
{
    usrHist.addEventListener('change', function(e){
        e.preventDefault();
        getHistory();
});
}


var urlText = document.getElementById('url');
var levelText = document.getElementById('levels');

window.addEventListener ('load', function () {
    setInterval (textbox, 2);
}, false);

function textbox(){

    regexString1 = /http:\/\//;
        regexString2 = /https:\/\//;

        if (regexString1.test(urlText.value) || regexString2.test(urlText.value))
        {
            // $("#crawlSubmit").removeAttr("disabled");
            flag1 = true;

            if (flag1 && flag2)
            {
                $("#crawlSubmit").removeAttr("disabled");
            }
        }
        else
            $("#crawlSubmit").attr("disabled", "disabled");



        if (levels.value !== '' && parseInt(levels.value) > 0)
        {
            // $("#crawlSubmit").removeAttr("disabled");
            flag2 = true;

            if (flag1 && flag2)
            {
                $("#crawlSubmit").removeAttr("disabled");
            }
        }
        else
            $("#crawlSubmit").attr("disabled", "disabled");




}
// if (urlText)
// {
//     url.addEventListener('input', function(e){
        
//         regexString1 = /http:\/\//;
//         regexString2 = /https:\/\//;

//         if (regexString1.test(urlText.value) || regexString2.test(urlText.value))
//         {
//             // $("#crawlSubmit").removeAttr("disabled");
//             flag1 = true;

//             if (flag1 && flag2)
//             {
//                 $("#crawlSubmit").removeAttr("disabled");
//             }
//         }
//         else
//             $("#crawlSubmit").attr("disabled", "disabled");



//     });
// }



// if (levels)
// {
//     levels.addEventListener('input', function(e){
        
       

//         if (levels.value !== '' && parseInt(levels.value) > 0)
//         {
//             // $("#crawlSubmit").removeAttr("disabled");
//             flag2 = true;

//             if (flag1 && flag2)
//             {
//                 $("#crawlSubmit").removeAttr("disabled");
//             }
//         }
//         else
//             $("#crawlSubmit").attr("disabled", "disabled");



//     });
// }


flag1 = false;
flag2 = false;