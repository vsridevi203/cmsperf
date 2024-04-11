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

    var data = {"OkPercent": 89.1891891891892, "KoPercent": 10.81081081081081};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7936936936936937, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.4878048780487805, 2000, 4000, "UnitOverview_AAEMonitor_UF1_LoadAAEMonitorTab"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_AAEMonitor_UF4_ViewUnAcknowlegedAlarms"], "isController": true}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.775, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm,Alert&isSummary=true"], "isController": false}, {"data": [0.49166666666666664, 2000, 4000, "UnitOverview_AAEMonitor_UF2_ViewAAEMAlertsOn"], "isController": true}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&system=BMU-BOD&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.0, 2000, 4000, "UnitOverview_AAEMonitor_UF6_ApplySystemFilter"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_AAEMonitor_UF5_ViewIsolatedAlarms"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_AAEMonitor_UF3_ViewAcknowlegedAlarms"], "isController": true}, {"data": [0.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=true"], "isController": false}, {"data": [0.9024390243902439, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm&isSummary=true"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 740, 80, 10.81081081081081, 776.5594594594587, 308, 3303, 387.0, 1877.6, 2122.7, 2346.0600000000013, 0.33885592166750084, 1.9046702488278562, 0.8959961239347217], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=true&isIsolated=false&isActive=true", 121, 0, 0.0, 378.66115702479334, 316, 715, 363.0, 439.99999999999994, 529.9999999999999, 709.0600000000001, 0.0569880273335302, 0.08611399436383699, 0.15176861356724797], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF1_LoadAAEMonitorTab", 41, 0, 0.0, 2300.7073170731705, 2049, 4409, 2188.0, 2521.4, 2903.7999999999997, 4409.0, 0.019696103534249602, 0.25816842225203324, 0.10348429626062268], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF4_ViewUnAcknowlegedAlarms", 53, 0, 0.0, 776.0188679245283, 678, 1196, 738.0, 954.0000000000001, 1137.3, 1196.0, 0.025308924069885105, 0.35856811762608976, 0.13449143224275747], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isAcknowledged=false&isIsolated=false", 121, 0, 0.0, 387.64462809917353, 322, 749, 374.0, 461.0, 500.0999999999999, 717.5400000000002, 0.0561712992514362, 0.7108169101433297, 0.1489026323042999], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=false&isActive=true", 128, 0, 0.0, 420.50781249999994, 343, 1935, 384.0, 493.40000000000003, 589.1499999999997, 1595.4099999999926, 0.059748198685166204, 0.7558421550906865, 0.15807845752439872], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm,Alert&isSummary=true", 60, 0, 0.0, 1980.5833333333328, 1703, 3303, 1898.0, 2257.9, 2324.0499999999997, 3303.0, 0.029197080291970805, 0.01337724300486618, 0.07653303680048662], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF2_ViewAAEMAlertsOn", 60, 0, 0.0, 2425.0, 2082, 4483, 2306.5, 2699.4, 2862.45, 4483.0, 0.029165700552835853, 0.3823540744301387, 0.1536126687418063], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&system=BMU-BOD&filter=typeId=4399,4400&isIsolated=false&isActive=true", 80, 0, 0.0, 413.275, 330, 1632, 371.0, 493.00000000000006, 604.8000000000002, 1632.0, 0.03822657368052619, 0.032650309575517796, 0.10169612502000923], "isController": false}, {"data": ["UnitOverview_AAEMonitor_UF6_ApplySystemFilter", 80, 80, 100.0, 2359.599999999999, 2095, 4417, 2243.0, 2677.2000000000003, 2828.0, 4417.0, 0.03818978509175812, 0.05734201825734282, 0.20226274252900395], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF5_ViewIsolatedAlarms", 68, 0, 0.0, 776.6323529411766, 678, 1860, 733.0, 854.3, 1046.1499999999999, 1860.0, 0.03241699699427697, 0.4774477290820984, 0.17115384844577186], "isController": true}, {"data": ["UnitOverview_AAEMonitor_UF3_ViewAcknowlegedAlarms", 68, 0, 0.0, 766.426470588235, 670, 1125, 733.0, 874.3000000000001, 1007.0499999999998, 1125.0, 0.03264574042699668, 0.4622875386407946, 0.17326171634020127], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true", 80, 80, 100.0, 1946.325, 1742, 2956, 1846.5, 2212.8, 2289.95, 2956.0, 0.03822432710850166, 0.02474549242608849, 0.10075553742089954], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399,4400&isIsolated=true", 68, 0, 0.0, 384.9117647058823, 308, 1359, 345.0, 447.5, 540.4, 1359.0, 0.032424540227172054, 0.0673021548729554, 0.08518519776823796], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&type=Alarm&isSummary=true", 41, 0, 0.0, 1864.6341463414633, 1695, 2782, 1775.0, 2115.0, 2348.8999999999996, 2782.0, 0.019714258650111817, 0.009029284479396917, 0.05155881559739252], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=20&unitNumber=R01&filter=typeId=4399&isIsolated=false&isActive=true", 41, 0, 0.0, 436.07317073170725, 348, 1627, 385.0, 562.6, 643.4999999999999, 1627.0, 0.0197150644249837, 0.24938730027678024, 0.05202299476757381], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 80, 100.0, 10.81081081081081], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 740, 80, "500/Internal Server Error", 80, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeOccuranceGraph?unitNumber=R01&system=BMU-BOD&type=Alarm,Alert&isSummary=true", 80, 80, "500/Internal Server Error", 80, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
