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
        $('#logout-app').click(StatsAnalytics.signOut)
        $( "li.dropdown" ).prop( "disabled", false );
      } else {
        console.log("Token not authenticated")
        window.location.href="signin.html"
      }
    }).catch(function handleTokenError(error){
      console.log("Handling token error")
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
  //const monthyear = moment().set({'year':2018, 'month': 3}).format('YYYYMM')
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

  function isValidURL(url, historyDate){
   // let isValid = false
    let historyTableDateFormat = historyDate.format('YYYY-MM')
    let urlDateFormat = historyDate.format('YYYYMM')
    const dataURL = getPath(urlDateFormat) + StatsAnalytics.info.report + '_' + my_tomo_id + '_' + urlDateFormat + '.csv'
  //  const dataFileName = /POI.+\.csv/.match(dataURL)
    const dataFileName = dataURL.match(/POI.+\.csv/)[0]
    console.log("Data file name", dataFileName)
    const pdfURL = dataURL.replace("csv", "pdf")
    const pdfFileName = dataFileName.replace("csv", "pdf")
   // console.log("Awaiting the isValidURL for", url)

    $.ajax({
      url: url,
      type: "get",
      success: function(data){
        console.log(url, "is a valid url")
       // isValid = true
        const newRow = "<tr><td>" + historyTableDateFormat + "</td><td><a href=\"" + pdfURL + "\">" + pdfFileName + "</a></td>"
          + "<td><a href=\"" + dataURL + "\">" + dataFileName + "</a></td></tr>"
        console.log("New Row", newRow)
        $("#history > tbody").append(newRow)

       /* return new Promise(
            function (resolve, reject) {
                resolve({isValid: isValid})
            }
        ); */
      },
      error: function(err){
        console.log(url, "is not a valid url")
        console.log("Error", err)
        tableFilled = true
      //  isValid = false;
      /*  return new Promise(
            function (resolve, reject) {
                resolve({isValid: isValid})
            }
        ); */
      }
    })


 //   return isValid
  }

  async function fillHistoryTable(){
    /**
       Start from current month, go back until an invalid url occurs
    **/
 //   let invalidMonth = false
    StatsAnalytics.info.report = 'POI_statistics'

   // let historyDate = moment().set({'year':2018, 'month': 3})
    let historyDate = moment().subtract(1, 'months')
    let historyDateFormat = historyDate.format('YYYYMM')
    let limit = 0;

    fillTable:
    while(!tableFilled){
          const dataURL = getPath(historyDateFormat) + StatsAnalytics.info.report + '_' + my_tomo_id + '_' + historyDateFormat + '.csv'
         // const pdfURL = dataURL.replace("csv", "pdf")
        //  console.log("The data url", dataURL)
          const validURL = await isValidURL(dataURL, historyDate)
          console.log("Is Valid:", validURL)
          historyDate = historyDate.subtract(1, 'month')
          historyDateFormat = historyDate.format('YYYYMM')
          limit++
          if(limit === 10){
            break;
          }     
    }

  }

}(jQuery));