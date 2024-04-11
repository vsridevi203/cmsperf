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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9552590266875981, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9444444444444444, 2000, 4000, "SR-CL-Export PDF/constraintStatusReport?limit=-1&unit=&InService=true-UF5"], "isController": false}, {"data": [0.9444444444444444, 2000, 4000, "SR-CL-Export PDF-UF5"], "isController": true}, {"data": [0.9661016949152542, 2000, 4000, "SR-CL-In Service Toggle ON-UF4"], "isController": true}, {"data": [0.9578313253012049, 2000, 4000, "SR-CL-View Selected Unit/constraintStatusReport?limit=20&unit=R01,R03,R04&InService=false-UF2"], "isController": false}, {"data": [0.9473684210526315, 2000, 4000, "SR-CL-Apply Filter-UF3"], "isController": true}, {"data": [0.9626865671641791, 2000, 4000, "SR-CL-Home/constraintStatusReport?limit=20&InService=false-UF1"], "isController": false}, {"data": [0.9578313253012049, 2000, 4000, "SR-CL-View Selected Unit-UF2"], "isController": true}, {"data": [0.9473684210526315, 2000, 4000, "SR-CL-Apply Filter/constraintStatusReport-UF3"], "isController": false}, {"data": [0.9333333333333333, 2000, 4000, "SR-CL-Export csv-UF6"], "isController": true}, {"data": [0.9333333333333333, 2000, 4000, "SR-US-Export csv/constraintStatusReport?limit=-1&unit=&InService=true-UF6"], "isController": false}, {"data": [0.9583333333333334, 2000, 4000, "SR-CL-In Service Toggle ON/constraintStatusReport?limit=20&unit=&InService=true-UF4"], "isController": false}, {"data": [0.9626865671641791, 2000, 4000, "SR-CL-Home-UF1"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 319, 0, 0.0, 1659.5736677115985, 1350, 4435, 1554.0, 1951.0, 2164.0, 3752.4, 0.14939842546236234, 0.5847351083080042, 0.3901360853104818], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SR-CL-Export PDF/constraintStatusReport?limit=-1&unit=&InService=true-UF5", 18, 0, 0.0, 1686.4444444444446, 1391, 3160, 1573.0, 2222.2000000000016, 3160.0, 3160.0, 0.008693829409679324, 0.1468909077456707, 0.022646784140426594], "isController": false}, {"data": ["SR-CL-Export PDF-UF5", 18, 0, 0.0, 1686.4444444444446, 1391, 3160, 1573.0, 2222.2000000000016, 3160.0, 3160.0, 0.008692851144099943, 0.1468743789742629, 0.02264423583077337], "isController": true}, {"data": ["SR-CL-In Service Toggle ON-UF4", 59, 0, 0.0, 1617.8983050847457, 1377, 3757, 1540.0, 1893.0, 2247.0, 3757.0, 0.029031918379959908, 0.07417708965843701, 0.07563839235628954], "isController": true}, {"data": ["SR-CL-View Selected Unit/constraintStatusReport?limit=20&unit=R01,R03,R04&InService=false-UF2", 83, 0, 0.0, 1633.433734939759, 1350, 4435, 1553.0, 1941.4, 2110.0, 4435.0, 0.04014863702633074, 0.08264028562611073, 0.10506659095867205], "isController": false}, {"data": ["SR-CL-Apply Filter-UF3", 76, 0, 0.0, 1707.8157894736846, 1411, 3990, 1555.0, 2070.2, 2758.499999999991, 3990.0, 0.037151878345196676, 0.09544228944539579, 0.09743822904450747], "isController": true}, {"data": ["SR-CL-Home/constraintStatusReport?limit=20&InService=false-UF1", 67, 0, 0.0, 1623.8507462686568, 1361, 3039, 1557.0, 1906.2, 2123.1999999999994, 3039.0, 0.03219975768480859, 0.08255881201637286, 0.08372509580028653], "isController": false}, {"data": ["SR-CL-View Selected Unit-UF2", 83, 0, 0.0, 1633.433734939759, 1350, 4435, 1553.0, 1941.4, 2110.0, 4435.0, 0.04014863702633074, 0.08264028562611073, 0.10506659095867205], "isController": true}, {"data": ["SR-CL-Apply Filter/constraintStatusReport-UF3", 76, 0, 0.0, 1707.8157894736846, 1411, 3990, 1555.0, 2070.2, 2758.499999999991, 3990.0, 0.037151878345196676, 0.09544228944539579, 0.09743822904450747], "isController": false}, {"data": ["SR-CL-Export csv-UF6", 15, 0, 0.0, 1764.2666666666667, 1404, 3594, 1608.0, 2728.8000000000006, 3594.0, 3594.0, 0.008789694259274885, 0.14839476011166428, 0.022900701468875104], "isController": true}, {"data": ["SR-US-Export csv/constraintStatusReport?limit=-1&unit=&InService=true-UF6", 15, 0, 0.0, 1764.2666666666667, 1404, 3594, 1608.0, 2728.8000000000006, 3594.0, 3594.0, 0.008789694259274885, 0.14839476011166428, 0.022900701468875104], "isController": false}, {"data": ["SR-CL-In Service Toggle ON/constraintStatusReport?limit=20&unit=&InService=true-UF4", 60, 0, 0.0, 1640.283333333333, 1377, 3757, 1540.0, 1902.9, 2278.35, 3757.0, 0.028100069969174225, 0.07179695937338718, 0.0732088232404907], "isController": false}, {"data": ["SR-CL-Home-UF1", 67, 0, 0.0, 1623.8507462686568, 1361, 3039, 1557.0, 1906.2, 2123.1999999999994, 3039.0, 0.03219565733441101, 0.08254829889198886, 0.08371443416012102], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 319, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
