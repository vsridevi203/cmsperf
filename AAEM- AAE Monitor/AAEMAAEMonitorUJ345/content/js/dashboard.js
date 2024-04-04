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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.44020926756352763, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4696969696969697, 500, 1500, "AAEMonitor(Alarms)-Acknowledged"], "isController": true}, {"data": [0.47865853658536583, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.45454545454545453, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true"], "isController": false}, {"data": [0.47988505747126436, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged"], "isController": true}, {"data": [0.0, 500, 1500, "AAEMonitor(Alarms)-Isolated"], "isController": true}, {"data": [0.4888888888888889, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.46808510638297873, 500, 1500, "AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 347, 0, 0.0, 1112.8270893371753, 911, 2232, 1057.0, 1347.6, 1536.1999999999996, 2119.6, 0.22827775943076606, 2.6905351187159474, 0.5947300946481036], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Acknowledged", 99, 0, 0.0, 1129.6969696969697, 947, 2122, 1059.0, 1352.0, 1623.0, 2122.0, 0.06211889430877985, 0.816449603811653, 0.16258904884678468], "isController": true}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 164, 0, 0.0, 1106.8597560975604, 936, 2170, 1061.0, 1331.0, 1470.0, 2073.7999999999993, 0.1091787362428135, 1.40030297827443, 0.28436881812853], "isController": false}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true", 44, 0, 0.0, 1097.1136363636365, 911, 1881, 1038.5, 1431.5, 1555.5, 1881.0, 0.03078772493406879, 0.12157721075982006, 0.0795386004599966], "isController": false}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged", 174, 0, 0.0, 1102.7758620689647, 876, 2170, 1058.0, 1312.5, 1440.0, 2059.0, 0.10922677487231766, 1.4009895871259297, 0.2845182895212603], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated", 49, 0, 0.0, 2192.938775510203, 1929, 3339, 2119.0, 2511.0, 2845.5, 3339.0, 0.03058159325107925, 0.5130157347758276, 0.15867005136771495], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 45, 0, 0.0, 1099.3555555555558, 953, 2232, 1057.0, 1200.3999999999999, 1418.6999999999994, 2232.0, 0.031089006443714737, 0.39876103616549574, 0.08096365297898314], "isController": false}, {"data": ["AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true", 94, 0, 0.0, 1137.042553191489, 947, 2122, 1066.5, 1359.5, 1677.5, 2122.0, 0.06215467786685145, 0.8169069329989103, 0.1626704459796503], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 347, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
