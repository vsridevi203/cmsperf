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

    var data = {"OkPercent": 99.79797979797979, "KoPercent": 0.20202020202020202};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8340206185567011, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.8145161290322581, 500, 1500, "AAEMonitor(Alarms)-Acknowledged"], "isController": true}, {"data": [0.8459915611814346, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.8235294117647058, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true"], "isController": false}, {"data": [0.8306451612903226, 500, 1500, "AAEMonitor(Alarms)-Isolated"], "isController": true}, {"data": [0.8522267206477733, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged"], "isController": true}, {"data": [0.8067226890756303, 500, 1500, "AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 495, 1, 0.20202020202020202, 1037.5777777777782, 0, 41854, 404.0, 764.6000000000005, 1472.9999999999998, 30638.320000000127, 0.22685474376183828, 1.6166506498242679, 0.5667380913003268], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Acknowledged", 124, 0, 0.0, 1075.3225806451608, 0, 40288, 434.0, 860.0, 1486.75, 37802.25, 0.05482344639637529, 0.11140071114631404, 0.13775936616027193], "isController": true}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 237, 1, 0.4219409282700422, 1051.1097046413495, 328, 41854, 399.0, 784.4000000000001, 1683.7999999999988, 31963.020000000055, 0.10861535133628962, 1.376835902340363, 0.2830073302186239], "isController": false}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true", 119, 0, 0.0, 1102.0840336134447, 331, 40258, 455.0, 754.0, 1337.0, 38284.799999999974, 0.05478122725600833, 0.12489819510242017, 0.14156552375686896], "isController": false}, {"data": ["AAEMonitor(Alarms)-Isolated", 124, 0, 0.0, 1057.6451612903222, 0, 40258, 438.0, 734.5, 1329.0, 37791.5, 0.05480793795741423, 0.11992042089070856, 0.13592347894712184], "isController": true}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged", 247, 1, 0.4048582995951417, 1008.5546558704455, 0, 41854, 398.0, 775.2000000000002, 1617.7999999999993, 30755.920000000122, 0.10870541097686995, 1.3221889577032528, 0.271774701929323], "isController": true}, {"data": ["AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true", 119, 0, 0.0, 1120.5042016806717, 330, 40288, 441.0, 860.0, 1493.0, 38299.39999999997, 0.05479848203599846, 0.11602855455649379, 0.14348220911446113], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 100.0, 0.20202020202020202], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 495, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 237, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
