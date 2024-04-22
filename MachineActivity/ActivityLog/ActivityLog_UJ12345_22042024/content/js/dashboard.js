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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "MA_ActivityLog_UF5_Toggle_DataError_ON"], "isController": true}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF1_Home"], "isController": true}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF3_ApplyFilter/cms/activityLogDetails?limit=25&fleetType=Long%20Regional"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF5_Toggle_DataError_ON/cms/activityLogDetails?limit=25&dataError=true"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF4_Toggle_AAEExists_ON/cms/activityLogDetails?limit=25&aaeExists=true"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF2_SelectUnits/cms/activityLogDetails?limit=25&unitNumber=R01"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF3_ApplyFilter"], "isController": true}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF2_SelectUnits"], "isController": true}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF1_Home/cms/activityLogDetails?limit=25"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF4_Toggle_AAEExists_ON"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 190, 0, 0.0, 2404.6684210526314, 1860, 4579, 2049.0, 3985.5, 4158.15, 4450.6900000000005, 0.0800586872313557, 0.18213515939473948, 0.20641282462217567], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_ActivityLog_UF5_Toggle_DataError_ON", 40, 0, 0.0, 2386.6000000000004, 1887, 4255, 2075.0, 4094.0, 4142.85, 4255.0, 0.016868213706773095, 0.036034803895418764, 0.043481362495171476], "isController": true}, {"data": ["MA_ActivityLog_UF1_Home", 35, 0, 0.0, 2393.142857142857, 1860, 4284, 1995.0, 3865.2, 4045.5999999999985, 4284.0, 0.016274497768998846, 0.04127973684950833, 0.04171021184629993], "isController": true}, {"data": ["MA_ActivityLog_UF3_ApplyFilter/cms/activityLogDetails?limit=25&fleetType=Long%20Regional", 36, 0, 0.0, 2399.055555555556, 1898, 4438, 2059.0, 4035.2000000000003, 4197.45, 4438.0, 0.018760298622264512, 0.046005581481969794, 0.04855672560614004], "isController": false}, {"data": ["MA_ActivityLog_UF5_Toggle_DataError_ON/cms/activityLogDetails?limit=25&dataError=true", 40, 0, 0.0, 2386.6000000000004, 1887, 4255, 2075.0, 4094.0, 4142.85, 4255.0, 0.016869593822354742, 0.036037752174068904, 0.04348492003285353], "isController": false}, {"data": ["MA_ActivityLog_UF4_Toggle_AAEExists_ON/cms/activityLogDetails?limit=25&aaeExists=true", 40, 0, 0.0, 2442.3250000000003, 1950, 4278, 2070.0, 4105.099999999999, 4232.299999999999, 4278.0, 0.01685449597893862, 0.03601825542061659, 0.04344476771133642], "isController": false}, {"data": ["MA_ActivityLog_UF2_SelectUnits/cms/activityLogDetails?limit=25&unitNumber=R01", 34, 0, 0.0, 2436.0, 1886, 4579, 2034.5, 4085.5, 4334.5, 4579.0, 0.016932785308717047, 0.03644809273339479, 0.04377593844359814], "isController": false}, {"data": ["MA_ActivityLog_UF3_ApplyFilter", 36, 0, 0.0, 2399.055555555556, 1898, 4438, 2059.0, 4035.2000000000003, 4197.45, 4438.0, 0.018760298622264512, 0.046005581481969794, 0.04855672560614004], "isController": true}, {"data": ["MA_ActivityLog_UF2_SelectUnits", 34, 0, 0.0, 2436.0, 1886, 4579, 2034.5, 4085.5, 4334.5, 4579.0, 0.016932776875803062, 0.0364480745814118, 0.04377591664218054], "isController": true}, {"data": ["MA_ActivityLog_UF1_Home/cms/activityLogDetails?limit=25", 35, 0, 0.0, 2393.1142857142854, 1860, 4284, 1995.0, 3865.2, 4045.5999999999985, 4284.0, 0.016276473102198114, 0.04128474721823449, 0.0417152744643529], "isController": false}, {"data": ["MA_ActivityLog_UF4_Toggle_AAEExists_ON", 40, 0, 0.0, 2442.3750000000005, 1950, 4278, 2070.0, 4105.099999999999, 4232.299999999999, 4278.0, 0.016852855611052944, 0.036014749935221836, 0.04344053943884204], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 190, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
