window._config = {
    carto: {
        dashboard_poi_master: 'https://roadtrippers.carto.com/u/ryanjudd/builder/b183b4cc-8333-4ea5-a6db-47b99faff75a/embed',
        dashboard_domestic_city: 'https://roadtrippers.carto.com/u/ryanjudd/builder/820b7b7d-db2b-4dd6-a8d9-03b3351be066/embed',
        dashboard_events_utility: 'https://roadtrippers.carto.com/u/ryanjudd/builder/18f7a4e8-003d-4aaf-8f4d-794463867ae9/embed',
        Dashboard_EntriesExits: 'https://roadtrippers.carto.com/u/ryanjudd/builder/15f9003c-62d1-4a3b-9409-2146d88e82c9/embed',
        Dashboard_OvernightClusters: 'https://roadtrippers.carto.com/u/ryanjudd/builder/a895af2c-44df-4e83-9341-0473bea9841a/embed',
        Dashboard_SearchHeatMap: 'https://roadtrippers.carto.com/u/ryanjudd/builder/855ac00f-e34b-45cb-b812-66c7b52776de/embed'
    },
    cognito: {
        userPoolId: 'ap-southeast-2_g7h1466rs',
        userPoolClientId: 'qad1atg52pkkke0vepub43nje', 
        region: 'ap-southeast-2'
    },
    tableau: {
        signinURL: 'https://hywr0jc0lc.execute-api.ap-southeast-2.amazonaws.com/dev/signin',
        siteURL: 'https://dub01.online.tableau.com/api/2.8/sites/',
        viewURL: 'https://hywr0jc0lc.execute-api.ap-southeast-2.amazonaws.com/dev/view1',
        vizBase: 'https://dub01.online.tableau.com/t/roadtrippersaustralasia/views/'
    },
    api: {
        retrieveViewURL: 'https://6h5d1mwjif.execute-api.ap-southeast-2.amazonaws.com/dev/reports/',
        retrieveS3ViewURL: 'https://s3-ap-southeast-2.amazonaws.com/rt-dashboard-images/',
        poiDataURL: 'https://hywr0jc0lc.execute-api.ap-southeast-2.amazonaws.com/dev/poidata/'
    },
    views: {
        infrastructure: [
            {
                workbook: 'Infrastructure_Dashboard',
                viz: 'infrastructure_dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Infrastructure_Dashboard',
                viz: 'infrastructure_dash2',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            }
        ],
        audience:[
            {
                workbook: 'Audience_Dashboard',
                viz: 'Audience_Dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Audience_Dashboard',
                viz: 'Audience_Dash2',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Audience_Dashboard',
                viz: 'Audience_Dash3',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            }
        ],
        behaviour:[
            {
                workbook: 'Behaviour_Dashboard',
                viz: 'Behaviour_Dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Behaviour_Dashboard',
                viz: 'Behaviour_Dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            }
        ],
        conversion:[
            {
                workbook: 'Conversion_Dashboard',
                viz: 'Conversion_Dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Conversion_Dashboard',
                viz: 'Conversion_Dash2',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Conversion_Dashboard',
                viz: 'Conversion_Dash3',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Conversion_Dashboard',
                viz: 'Conversion_Dash4',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            },
            {
                workbook: 'Conversion_Dashboard',
                viz: 'Conversion_Dash5',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            }
        ],
        custom: [
            {
                workbook: 'Custom_Dashboard',
                viz: 'Custom_Dash1',
                options: {
                  width: 1020,
                  height: 500,
                  hideTabs: true,
                  hideToolbar: true
                }
            }
        ]
    }
};
