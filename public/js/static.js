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




function getForm(){

    var data = {};
    data.action = 'insert';

    data.formInfo = {};
    data.formInfo.url = document.getElementsByName('url')[0].value;
    data.formInfo.search = document.getElementsByName('search_term')[0].value;
    data.formInfo.levels = document.getElementsByName('levels')[0].value;
    var cType = document.getElementsByName('crawl_type');

    data.formInfo.crawl_type = cType[0].options[cType[0].selectedIndex].value;
    /*obtains the form information */


    /*If form information is complete, AJAX function is called */
    if (data.formInfo.info !== '' &&
        data.formInfo.search !== '' &&
        data.formInfo.levels !== ''){
        data = JSON.stringify(data);

        AJAX('POST', '/', data, function(response){
            
            resetForm();
            // makeTable(response);

            
        });
    }
    else
    {
        alert("Invalid Input!");
        /*displays alert if form is not complete*/
    }
}


/*Resets the form elements*/
function resetForm(){
    document.getElementsByName('url')[0].value = '';
    document.getElementsByName('search_term')[0].value = '';
    document.getElementsByName('levels')[0].value = '';
    document.getElementsByName('crawl_type')[0].value = '';
}



/*Inserts a new exercise to the table when form is submitted*/
document.getElementById('crawlSubmit').addEventListener('click', function(e){
    e.preventDefault();
    getForm();
});