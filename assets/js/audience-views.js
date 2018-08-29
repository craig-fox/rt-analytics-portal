(function(){

	const region = 'Yorke Peninsula'

 	const loadMap = (name) => {
        const frame = document.getElementById(name)
        let url = ''

        console.log('name', name)

        switch(name){
        	case 'dashboard_poi_master':
        		url = _config.carto['dashboard_poi_master'];
        		console.log("Map Wees Url", url)
        		$('#dashboard_poi_master').attr('src', url);
        		$('#dashboard_poi_master').siblings().hide()
        		break;
        	case 'dashboard_events_utility':
				url = _config.carto['dashboard_events_utility'];
				console.log("Map Wees Url", url)
				$('#dashboard_events_utility').attr('src', url);
				$('#dashboard_events_utility').siblings().hide()
        		break;
        }
     }

	const views = _config.views.audience
    const view = views[0]  
    loadViz(view.workbook, view.viz, vizOptions(view, region)) 
    $('div#infrastructure_dash1 div.loader').hide() 

    const view2 = views[1]
    loadViz(view2.workbook, view2.viz, vizOptions(view2, region))
    $('div#infrastructure_dash2 div.loader').hide() 

    loadMap('dashboard_poi_master')
    loadMap('dashboard_events_utility')


}())