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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9948805460750854, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834"], "isController": false}, {"data": [0.9803149606299213, 2000, 4000, "MA_SU_UFWL_UF4_Home"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlAAELogDetails?limit=10&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5"], "isController": false}, {"data": [0.9960629921259843, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlUtilisationStatusDetails"], "isController": false}, {"data": [0.9921259842519685, 2000, 4000, "MA_SU_UFWL_UF4_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834"], "isController": false}, {"data": [0.9960629921259843, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel/ufwlAAELogDetails?limit=-1&sort="], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 641, 0, 0.0, 342.7316692667708, 100, 6315, 219.0, 757.0, 832.9, 1259.1400000000012, 0.32032990482054025, 0.32829100950520274, 0.8320113269853708], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU_UFWL_UF6_Export-Excel", 23, 0, 0.0, 1026.5217391304348, 932, 1196, 999.0, 1173.4, 1192.6, 1196.0, 0.011756575503794818, 0.04329047443916023, 0.061818861393552894], "isController": true}, {"data": ["MA_SU_UFWL_UF6_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834", 23, 0, 0.0, 768.9565217391303, 694, 943, 736.0, 889.2000000000002, 939.1999999999999, 943.0, 0.011758619067776682, 0.021762831401341096, 0.03157482785765118], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home", 127, 0, 0.0, 1414.40157480315, 1139, 11330, 1262.0, 1490.0, 1802.7999999999995, 3174.31999999999, 0.06345209366927969, 0.26359639487811704, 0.6581271374487262], "isController": true}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlAAELogDetails?limit=10&sort=", 126, 0, 0.0, 266.26190476190453, 215, 1889, 249.0, 279.3, 303.9, 395.620000000006, 0.0636963926609623, 0.07558318692009743, 0.16197596131000225], "isController": false}, {"data": ["MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month", 88, 0, 0.0, 189.75000000000003, 138, 1273, 165.0, 203.20000000000002, 245.1, 1273.0, 0.044134809776462204, 0.02298720661009052, 0.1149835414460971], "isController": true}, {"data": ["MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5", 88, 0, 0.0, 189.75000000000003, 138, 1273, 165.0, 203.20000000000002, 245.1, 1273.0, 0.04413782034402422, 0.02298877463630185, 0.11499138481784371], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlUtilisationStatusDetails", 127, 0, 0.0, 166.4330708661418, 100, 2051, 127.0, 189.4, 317.5999999999994, 1648.9199999999992, 0.06349780932557826, 0.038596812941203526, 0.1631491565103504], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834", 127, 0, 0.0, 802.7559055118113, 644, 6315, 740.0, 892.8, 952.7999999999998, 1090.9999999999945, 0.06351092387890717, 0.11766672305136484, 0.16863838080149787], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10", 127, 0, 0.0, 179.11023622047236, 121, 2680, 138.0, 184.00000000000003, 258.79999999999967, 1648.039999999999, 0.06353163875610054, 0.0322172160485922, 0.16546423712758954], "isController": false}, {"data": ["MA_SU_UFWL_UF6_Export-Excel/ufwlAAELogDetails?limit=-1&sort=", 23, 0, 0.0, 257.5652173913043, 219, 343, 244.0, 332.0, 342.0, 343.0, 0.011761625599842906, 0.02154067419427751, 0.030262514849052322], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 641, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
