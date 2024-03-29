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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8023872679045093, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7946428571428571, 500, 1500, "AAEMonitor(Alarms)-Acknowledged"], "isController": true}, {"data": [0.8526315789473684, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.8, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true"], "isController": false}, {"data": [0.8526315789473684, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged"], "isController": true}, {"data": [0.42, 500, 1500, "AAEMonitor(Alarms)-Isolated"], "isController": true}, {"data": [0.84, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.7946428571428571, 500, 1500, "AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 201, 0, 0.0, 672.0597014925376, 348, 6538, 447.0, 635.0000000000001, 2425.5999999999935, 6452.359999999995, 0.22590209111159565, 1.8487271600763573, 0.5882351107622679], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Acknowledged", 56, 0, 0.0, 725.3392857142857, 348, 6538, 439.0, 1523.7000000000012, 2612.8499999999985, 6538.0, 0.06291746015695658, 0.09438825936318543, 0.16457791758655366], "isController": true}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 95, 0, 0.0, 612.9368421052635, 382, 5980, 441.0, 590.2, 1421.9999999999893, 5980.0, 0.10911200059724463, 1.36748921801152, 0.28403105492640685], "isController": false}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true", 25, 0, 0.0, 653.88, 368, 2779, 476.0, 1482.4000000000042, 2753.7999999999997, 2779.0, 0.032989756020960374, 0.07502721036313803, 0.08517156033958335], "isController": false}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged", 95, 0, 0.0, 612.9368421052635, 382, 5980, 441.0, 590.2, 1421.9999999999893, 5980.0, 0.10911024614123001, 1.3674672295989683, 0.2840264878761289], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated", 25, 0, 0.0, 1449.4399999999998, 790, 6915, 933.0, 3357.800000000001, 5930.099999999998, 6915.0, 0.032969612567488794, 0.48834435589905495, 0.1709306987810475], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 25, 0, 0.0, 795.5600000000001, 377, 6462, 429.0, 1633.4000000000055, 5477.999999999998, 6462.0, 0.03298784068192464, 0.41359149548726337, 0.08585858689986871], "isController": false}, {"data": ["AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true", 56, 0, 0.0, 725.3392857142857, 348, 6538, 439.0, 1523.7000000000012, 2612.8499999999985, 6538.0, 0.06293789603109132, 0.09441891709449451, 0.16463137323464822], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 201, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
