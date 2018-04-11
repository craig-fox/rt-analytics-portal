/*global StatsAnalytics _config*/

var StatsAnalytics = window.StatsAnalytics || {};
StatsAnalytics.map = StatsAnalytics.map || {};
StatsAnalytics.info = StatsAnalytics.info || {};

//Fixed data
StatsAnalytics.info.country = 'New Zealand';
StatsAnalytics.info.state = 'Auckland';
StatsAnalytics.info.region = 'Northland';
StatsAnalytics.info.operator = 'craigs-place';

const tomo_id = 3213273;
const basePath = 'https://s3-ap-southeast-2.amazonaws.com/rt-dashboard-images/'
  + StatsAnalytics.info.country + '/'
  + StatsAnalytics.info.state + '/'
  + StatsAnalytics.info.region + '/'
  + StatsAnalytics.info.operator + '/'
  + tomo_id + '/';


(function($){
  let authToken;
  if(StatsAnalytics.authToken){
    StatsAnalytics.authToken.then(function setAuthToken(token){
      if(token){
        authToken = token
        $('#signup').hide()
        $( "li.dropdown" ).prop( "disabled", false );
      } else {
        window.location.href="signin.html"
      }
    }).catch(function handleTokenError(error){
      window.location.href="signin.html"
    })
  } else {
    $('#signup').show();
    $( "li.dropdown" ).prop( "disabled", true );
  }

  $("#operatorName").text(StatsAnalytics.info.operator)
  $("#regionName").text(StatsAnalytics.info.region)
  $("#stateName").text(StatsAnalytics.info.state)
  $("#countryName").text(StatsAnalytics.info.country)
  
  let totalVisits = [];
  let visitsAfterBrowse = [];
  let profileViews = []; 

  $(function() {
    requestReports()
    $('#poiViewPDF').attr('href', basePath + 'profileviews-view.pdf')
    $('#poiViewCSV').attr('href', basePath + 'profileviews-view.csv')
    $('#visitsAfterPDF').attr('href', basePath + 'visitafterbrowse-view.pdf')
    $('#visitsAfterCSV').attr('href', basePath + 'visitafterbrowse-view.csv')
    $('#totalVisitsPDF').attr('href', basePath + 'allvisits-view.pdf')
    $('#totalVisitsCSV').attr('href', basePath + 'allvisits-view.csv')
  });

  function requestImage(name){
    const url = _config.api.retrieveS3ViewURL + name + '/view.png'
    $("#img").attr('src', url)
  }

  function storeCsvData(result){
    const rows = result.split("\n")
    let header = rows[0].split(",")
   // console.log("Header", header)
    let data = []
    data.push(header)

    if(StatsAnalytics.info.report === 'profileviews'){
       for(let i=1; i < rows.length; i++){
        const preData = rows[i].split("\"")
        const line = preData[0].replace(/,\s*$/, "") + preData[1]
        data.push(line)
      }
    } else {
      for(let i=1; i < rows.length; i++){
          const line = rows[i]
          data.push(line)
      }
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

    if(tableName === 'poiviews-table'){
       header.pop() //Remove column with nonsensical value, 0))"
    } 

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

  function renderData(){
    fillTable('poiviews-table', profileViews)
    fillTable('visitsafter-table', visitsAfterBrowse)
    fillTable('totalvisits-table', totalVisits)
  }

  async function requestReports(){
    StatsAnalytics.info.report = 'allvisits'
    const visits = await requestCsv(StatsAnalytics.info.report)
    totalVisits = visits.split('\n')
    StatsAnalytics.info.report = 'visitafterbrowse'
    const visits2 = await requestCsv(StatsAnalytics.info.report)
    visitsAfterBrowse = visits2.split('\n')
    StatsAnalytics.info.report = 'profileviews'
    const visits3 = await requestCsv(StatsAnalytics.info.report) 
    profileViews = visits3.split('\n')
    renderData()
  }

  function requestCsv(report){
    const path = StatsAnalytics.info.country 
      + '/' + StatsAnalytics.info.state
      + '/' + StatsAnalytics.info.region
      + '/' + StatsAnalytics.info.operator 
      + '/' + tomo_id + '/'

    const url = _config.api.retrieveS3ViewURL + path + report + '-view.csv'
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

  function handleImage(data){
    /** Need to find out how to display image loaded from API Gateway */
     console.log("Handling the data");
  }

}(jQuery));