/*global GeoAnalytics _config*/

(function(){
	

	/* $( "a[href='audience.html']" ).click( ()=> {
    })

    $( "a[href='index.html']" ).click( ()=> {
    }) */

      const vizOptions = (view, region) => {
        const options = {}
        options.width = view.options.width
        options.height = view.options.height
        options.hideTabs = view.options.hideTabs
        options.hideToolbar = view.options.hideToolbar
        options['Tourism Region'] = region

        return options
      }

      function loadViz (workbook, viz, options){
        const vizDiv = document.getElementById(viz)
        const url = _config.tableau.vizBase + workbook +'/' + viz + '?:embed=yes'
        console.log("Viz Url", url)
        const tViz = new tableau.Viz(vizDiv, url, options); 
      }

     /* function loadAudienceViews(){
         const views = _config.views.audience
         console.log("Audience Views")
         const view = views[0]  
         loadViz(view.workbook, view.viz, vizOptions(view, region)) 
         $('div#Audience_Dash1 div.loader').hide()
      } */

      this.loadViz = loadViz
      this.vizOptions = vizOptions

}())	