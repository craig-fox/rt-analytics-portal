//*global StatsAnalytics _config*/

//let StatsAnalytics = window.StatsAnalytics || {};
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
        $('#logout-app').click(StatsAnalytics.signOut)
        $( "li.dropdown" ).prop( "disabled", false );
      } else {
        console.log("Token not authenticated")
        window.location.href="signin.html"
      }
    }).catch(function handleTokenError(error){
      console.log("Handling token error", error)
      window.location.href="signin.html"
    })
  } else {
    console.log("There is no SA auth token")
    window.location.href="signin.html"
    $('#signup').show();
    $( "li.dropdown" ).prop( "disabled", true );
  }
  
  let poiStats = []
  let tableFilled = false
 // const monthyear = moment().set({'year':2018, 'month': 4}).format('YYYYMM')
  const monthyear = moment().subtract(1, 'months').format('YYYYMM')
  console.log("Month Year is", monthyear)
 
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

      /* Temporary fix until data loaded */
      if(result.country === null){
        result.country = 'Australia'
      }

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
  
      renderPdf(monthyear)
      const downloadPath = basePath + my_tomo_id + '/' + monthyear + '/'
      $('#poiStatsCSV').attr('href', downloadPath + 'POI_statistics_' + my_tomo_id + monthyear + '.csv')
      fillHistoryTable()
   
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

  function getThisMonth(stats){
    const rowData = stats.split("\n")
    let thisMonth = ''
    let gzItems = rowData.filter(s => s.includes('Geozone'))  
    const monthItem = gzItems[0]
    thisMonth = monthItem.split("\",")[0].replace(/\d+\,\s+/, "").replace("\"", "")
    $("#thisMonth").text(thisMonth)
  }

  function renderData(stats){
    getThisMonth(stats)
  }

  function getPath(report_date){
    return basePath + my_tomo_id + '/' + report_date + '/';
  }

  function renderPdf(report_date){
    const path = getPath(report_date)
    StatsAnalytics.info.report = 'POI_statistics'
    const url = path + StatsAnalytics.info.report + '_' + my_tomo_id + '_' + report_date + '.pdf'
    console.log("pdf-s3 view", url)
    if(report_date === monthyear){
      $("#poiStatsPDFDisplay").attr("data", url)
      $("#poiStatsPDF").attr("href", url)
    }
    requestReports(report_date)
  }

  async function requestReports(report_date){
    StatsAnalytics.info.report = 'POI_statistics'
    const stats = await requestCsv(StatsAnalytics.info.report, report_date)
    renderData(stats)
  }

  function requestCsv(report, report_date){
    const path = getPath(report_date)
    const url = path + report + '_' + my_tomo_id + '_' + report_date + '.csv'
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

  let pdfURLValid = false
  let dataURLValid = false

  async function fillHistoryTable(){
    let historyDate = moment().subtract(1, 'months')
    let historyDateFormat = historyDate.format('YYYYMM')
    const earliest = '201706' //One month before final row date
    let historyTableDateFormat = historyDate.format('YYYY-MM')
 
    while(!tableFilled){
      const pdfURL = getPath(historyDateFormat) + StatsAnalytics.info.report + '_' + my_tomo_id + '_' + historyDateFormat + '.pdf'
      const dataURL = getPath(historyDateFormat) + StatsAnalytics.info.report + '_' + my_tomo_id + '_' + historyDateFormat + '.csv'
      const pdfFileName = pdfURL.match(/POI.+\.pdf/)[0]
      const dataFileName = dataURL.match(/POI.+\.csv/)[0]

      const pdfResult = await axios.head(pdfURL)
      const dataResult = await axios.head(dataURL)
      const isPdfValid = pdfResult.statusText === 'OK'
      const isDataValid = dataResult.statusText === 'OK'

      const pdfName = isPdfValid ? pdfFileName : "PDF not present for this month"
      const dataName = isDataValid ? dataFileName : "CSV not present for this month"

      const newRow = "<tr><td>" + historyTableDateFormat + "</td><td><a href=\"" + pdfURL + "\">" + pdfName + "</a></td>"
        + "<td><a href=\"" + dataURL + "\">" + dataName + "</a></td></tr>"
      console.log("New Row", newRow)
      $("#history > tbody").append(newRow)
      historyDate = historyDate.subtract(1, 'month')
      historyDateFormat = historyDate.format('YYYYMM')
      if(historyDateFormat === earliest){
        tableFilled = true;
      } else {
        historyTableDateFormat = historyDate.format('YYYY-MM')
      }    
    }

  }

}(jQuery));