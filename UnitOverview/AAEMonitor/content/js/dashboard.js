/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 92.90657439446366, "KoPercent": 7.093425605536332};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.42675893886966554, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6736111111111112, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.3017241379310345, 500, 1500, "UnitOverview_AAEMonitor_UF4_ViewUnAcknowlegedAlarms"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_AAEMonitor_UF1_LoadAAEMonitorTab"], "isController": true}, {"data": [0.6504854368932039, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.6402877697841727, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm,Alert&isSummary=true"], "isController": false}, {"data": [0.0, 500, 1500, "UnitOverview_AAEMonitor_UF2_ViewAAEMAlertsOn"], "isController": true}, {"data": [0.6219512195121951, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&system=BMU-BOD&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.2777777777777778, 500, 1500, "UnitOverview_AAEMonitor_UF5_ViewIsolatedAlarms"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_AAEMonitor_UF6_ApplySystemFilter"], "isController": true}, {"data": [0.3313953488372093, 500, 1500, "UnitOverview_AAEMonitor_UF3_ViewAcknowlegedAlarms"], "isController": true}, {"data": [0.6777777777777778, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=true"], "isController": false}, {"data": [0.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true"], "isController": false}, {"data": [0.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm&isSummary=true"], "isController": false}, {"data": [0.4166666666666667, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 578, 41, 7.093425605536332, 1475.0847750865057, 323, 17486, 728.5, 3504.9000000000037, 6014.249999999999, 9776.940000000022, 0.3213349744766632, 2.024971928360091, 0.8501327322270625], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=true&isIsolated=false&isActive=true", 144, 0, 0.0, 1447.2916666666674, 326, 11553, 482.5, 5880.5, 6941.0, 11390.550000000005, 0.08140983747430502, 0.22334207222946495, 0.21666502569073987], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF4_ViewUnAcknowlegedAlarms", 58, 0, 0.0, 2620.2586206896553, 700, 16236, 1278.5, 11015.5, 11458.599999999991, 16236.0, 0.032810885973119965, 0.49250304402287487, 0.17425645423362257], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF1_LoadAAEMonitorTab", 6, 0, 0.0, 3493.3333333333335, 2349, 5398, 3306.0, 5398.0, 5398.0, 5398.0, 0.006081387204964033, 0.0781889812612189, 0.031926293016945786], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=false&isIsolated=false", 103, 0, 0.0, 1330.0194174757287, 336, 17486, 609.0, 3852.6000000000104, 6064.799999999998, 17152.919999999947, 0.05747925026967814, 0.7048690618842256, 0.15225472561052172], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=false&isActive=true", 139, 0, 0.0, 1252.9999999999998, 345, 9648, 577.0, 4078.0, 5134.0, 8602.799999999985, 0.0773548428027162, 0.9482419190275662, 0.20454882127080093], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm,Alert&isSummary=true", 53, 0, 0.0, 1980.3962264150944, 1778, 3105, 1869.0, 2393.0000000000005, 2915.9999999999995, 3105.0, 0.029503993337664295, 0.013518495768125333, 0.07729739646046715], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF2_ViewAAEMAlertsOn", 53, 0, 0.0, 3196.584905660378, 2155, 8453, 2615.0, 5464.4, 7142.5999999999985, 8453.0, 0.029460795185772548, 0.374654005021398, 0.15508770127837618], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&system=BMU-BOD&filter=typeId=4399,4400&isIsolated=false&isActive=true", 41, 0, 0.0, 1268.6585365853657, 346, 7147, 531.0, 4191.4000000000015, 5875.999999999998, 7147.0, 0.02312230004850043, 0.03299322668172436, 0.0614819446911763], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF5_ViewIsolatedAlarms", 45, 0, 0.0, 2798.5777777777776, 704, 27748, 1242.0, 8136.999999999997, 13576.099999999984, 27748.0, 0.025102879969742663, 0.3600912252604145, 0.13245800462506618], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF6_ApplySystemFilter", 41, 41, 100.0, 3377.9268292682937, 2201, 9322, 2683.0, 6420.400000000001, 7871.999999999999, 9322.0, 0.023092528947329886, 0.04790115665408406, 0.12224123483637536], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF3_ViewAcknowlegedAlarms", 86, 0, 0.0, 2858.3023255813955, 699, 21201, 911.5, 10053.3, 13140.149999999996, 21201.0, 0.04861239864880142, 0.7292478050936749, 0.2578459828494327], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=true", 45, 0, 0.0, 1524.7555555555555, 323, 11546, 503.0, 6299.799999999998, 9252.499999999985, 11546.0, 0.0251379936194186, 0.052445012035512724, 0.0660019625441102], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true", 41, 41, 100.0, 2109.268292682926, 1831, 3489, 1973.0, 2646.6000000000004, 3146.3999999999996, 3489.0, 0.023127438957663247, 0.014973011583180372, 0.06093042339148662], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm&isSummary=true", 6, 0, 0.0, 2445.3333333333335, 1796, 3182, 2397.0, 3182.0, 3182.0, 3182.0, 0.006097808854018456, 0.002802768913370462, 0.015935289544290417], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399&isIsolated=false&isActive=true", 6, 0, 0.0, 1048.0, 553, 2388, 852.0, 2388.0, 2388.0, 2388.0, 0.006094718012634351, 0.07555902848671199, 0.016069065281032528], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 41, 100.0, 7.093425605536332], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 578, 41, "500/Internal Server Error", 41, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true", 41, 41, "500/Internal Server Error", 41, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
