/*global StatsAnalytics _config*/

var StatsAnalytics = window.StatsAnalytics || {};
StatsAnalytics.map = StatsAnalytics.map || {};
StatsAnalytics.info = StatsAnalytics.info || {};

StatsAnalytics.info.country = '';
StatsAnalytics.info.state = '';
StatsAnalytics.info.region = '';
StatsAnalytics.info.operator = '';

let basePath = _config.api.retrieveS3ViewURL
let poi_data_url = _config.api.poiDataURL;
let my_tomo_id = -1;

(function($){
  let authToken;
  if(StatsAnalytics.authToken){
    StatsAnalytics.authToken.then(function setAuthToken(token){
      if(token){
        console.log("Token authenticated")
        authToken = token
        $('#signup').hide()
        $('#logout').click(StatsAnalytics.signOut)
        $( "li.dropdown" ).prop( "disabled", false );
      } else {
        console.log("Token not authenticated")
       // window.location.href="signin.html"
      }
    }).catch(function handleTokenError(error){
      console.log("Handling token error")
      //window.location.href="signin.html"
    })
  } else {
    console.log("There is no SA auth token")
    window.location.href="signin.html"
    $('#signup').show();
    $( "li.dropdown" ).prop( "disabled", true );
  }
  
  let poiStats = [];
 
  $(function() {
    my_tomo_id = StatsAnalytics.tomo_id || -1
    $("#tomo_id").text(my_tomo_id)
    console.log("The tomo id is", my_tomo_id)
    let fetchUrl = poi_data_url + my_tomo_id
    console.log('Fetch URL', fetchUrl)

    fetch(fetchUrl)
    .then(function(response) {
      return response.json() 
    })
    .then(function(result) {
      console.log(result);
      StatsAnalytics.info.country = result.country;
      StatsAnalytics.info.state = result.state;
      StatsAnalytics.info.region = result.region;
      StatsAnalytics.info.operator = result.operator;
      basePath = basePath + StatsAnalytics.info.country 
        + '/' + StatsAnalytics.info.state 
        + '/' + StatsAnalytics.info.region
        + '/' + StatsAnalytics.info.operator + '/'
     
      $("#operatorName").text(StatsAnalytics.info.operator)
      $("#regionName").text(StatsAnalytics.info.region)
      $("#stateName").text(StatsAnalytics.info.state)
      $("#countryName").text(StatsAnalytics.info.country)
  
      renderPdf()
      const downloadPath = basePath + my_tomo_id + '/'
      $('#poiStatsCSV').attr('href', downloadPath + 'poistats-view.csv')
   
    })
    .catch(function(error) {
      console.log("Problem occurred", error)
    });   
   
  });

  function storeCsvData(result){
    const rows = result.split("\n")
    let header = rows[0].split(",")
   // console.log("Header", header)
    let data = []
    data.push(header)

    for(let i=1; i < rows.length; i++){
        const line = rows[i]
        data.push(line)
    }
  
    return new Promise(
        function (resolve, reject) {
            resolve(data)
        }
    );
  }


  function fillTable(tableName, rows){
    const table = document.getElementById(tableName)
    const theader = table.createTHead()
    const row = theader.insertRow(0)
    const header = rows[0].split(',')

    for(let i=0; i < header.length; i++){
      let cell = row.insertCell(i)
      let columnName = header[i]
      const startRegex = /.+\[/
      if(startRegex.test(columnName)){
        columnName = columnName.replace(startRegex, '')
        columnName = columnName.replace(/\]./, '')
      }
      cell.innerHTML = columnName
    } 

    if(tableName === 'poiviews-table'){
      for(let i=1; i < rows.length; i++){
        const row = table.insertRow(i)
        let rowData = rows[i].split(",")
        for(let p=0; p < rowData.length; p++){
          let cell = row.insertCell(p)
          cell.innerHTML = rowData[p]
        } 
      }

    } else {
      for(let i=1; i < rows.length; i++){
        const row = table.insertRow(i)
        let rowData = []
        let startDate = ''
        let endDate = ''

        const preData = rows[i].split("\",")
        const day = preData[0].replace('\"', '')
        rowData.push(day)
        if(preData[1]){
          let extras = preData[1].split(",")
          rowData.push(...extras)
        }
        for(let p=0; p < rowData.length; p++){
          let cell = row.insertCell(p)
          cell.innerHTML = rowData[p]
        } 
      }
    } 
  }

  function getStartEndDates(stats){
    const rowData = stats.split("\n")
    let startDate = '', endDate = ''
    let gzItems = rowData.filter(s => s.includes('gz'))  
    const startDateItem = gzItems[0]
    const endDateItem = gzItems[gzItems.length-1]
    startDate = startDateItem.split("\",")[0].replace("\"", "")
    endDate = endDateItem.split("\",")[0].replace("\"", "")
    $("#startDate").text(startDate)
    $("#endDate").text(endDate)
  }

  function renderData(stats){
    getStartEndDates(stats)
  }

  function renderPdf(){
    const path = basePath + my_tomo_id + '/'
    StatsAnalytics.info.report = 'poistats'
    const url = path + StatsAnalytics.info.report + '-view.pdf'
    console.log("pdf-s3 view", url)
    $("#poiStatsPDFDisplay").attr("data", url)
    $("#poiStatsPDF").attr("href", url)
    requestReports()
  }

  async function requestReports(){
    StatsAnalytics.info.report = 'poistats'
    const stats = await requestCsv(StatsAnalytics.info.report)
    renderData(stats)
  }

  function requestCsv(report){
    const path = basePath + my_tomo_id + '/'
    const url = path + report + '-view.csv'
    console.log("s3 view", url)
    
    const results = $.ajax({
          type: "GET",
          url: url,
          dataType: "text",
          success: storeCsvData,
          error: function(err){
            console.log('wrong place')
            console.log(err)
          }
      }); 

    return results
  }

}(jQuery));