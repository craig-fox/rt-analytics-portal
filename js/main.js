/*global StatsAnalytics _config*/

var StatsAnalytics = window.StatsAnalytics || {};
StatsAnalytics.map = StatsAnalytics.map || {};
StatsAnalytics.info = StatsAnalytics.info || {};

//Fixed data
StatsAnalytics.info.country = 'New Zealand';
StatsAnalytics.info.state = 'Auckland';
StatsAnalytics.info.region = 'Auckland';
StatsAnalytics.info.operator = 'craigs-venue';

const tomo_id = 59775219;


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

  $(document).on("click", "a.dropdown-item.report", function(e){
    const name = ($(this).attr('name')) || '';
    const id = ($(this).attr('id')) || '';

    if(name !== undefined && name != ''){
      StatsAnalytics.info.report = name
      StatsAnalytics.info.reportCrumb = id
      $("#infoContainer").show()
      $("#reportName").text(StatsAnalytics.info.report)
      const path = StatsAnalytics.info.country 
      + '/' + StatsAnalytics.info.state
      + '/' + StatsAnalytics.info.region
      + '/' + StatsAnalytics.info.operator 
      + '/' + tomo_id + '/'

      const url = _config.api.retrieveS3ViewURL + path + StatsAnalytics.info.reportCrumb + '-view.pdf';
      $("#downloadPDF").attr('href', url);
      requestCsv()
    }
  });

  function requestImage(name){
    const url = _config.api.retrieveS3ViewURL + name + '/view.png'
    $("#img").attr('src', url)
  }

  function handleCsv(result){
    const rows = result.split("\n")
    let header = rows[0].split(",")
    header.pop() //Remove column with nonsensical value, 0))"
    const table = document.getElementById('dashboard-table')
    const theader = table.createTHead()
    const row = theader.insertRow(0)

    for(let i=0; i < header.length; i++){
      let cell = row.insertCell(i)
      let columnName = header[i]
      const startRegex = /.+\[/
      if(startRegex.test(columnName)){
        columnName = columnName.replace(startRegex, '')
        columnName = columnName.replace(/\].*/, '')
      }
      cell.innerHTML = columnName
    }

    for(let i=1; i < rows.length; i++){
      const preData = rows[i].split("\"")
      let data = preData[0].replace(/,\s*$/, "").split(",")
      if(preData.length > 1){
        data.push(preData[1])
      }
      const row = table.insertRow(i)

      for(let p=0; p < data.length; p++){
        let cell = row.insertCell(p)
        cell.innerHTML = data[p]
      }
    }
  }

  function requestCsv(){
    const path = StatsAnalytics.info.country 
      + '/' + StatsAnalytics.info.state
      + '/' + StatsAnalytics.info.region
      + '/' + StatsAnalytics.info.operator + '/'

    const url = _config.api.retrieveS3ViewURL + path + StatsAnalytics.info.reportCrumb + '-view.csv'
    
    $.ajax({
          type: "GET",
          url: url,
          dataType: "text",
          success: handleCsv,
          error: function(err){
            console.log('wrong place')
            console.log(err)
          }
      });
    
  }

  function handleImage(data){
    /** Need to find out how to display image loaded from API Gateway */
     console.log("Handling the data");
  }

}(jQuery));