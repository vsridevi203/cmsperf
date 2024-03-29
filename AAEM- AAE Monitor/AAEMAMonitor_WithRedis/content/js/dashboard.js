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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7853535353535354, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.7666666666666667, 500, 1500, "AAEMonitor(Alarms)-Acknowledged"], "isController": true}, {"data": [0.8263157894736842, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.88, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true"], "isController": false}, {"data": [0.8173076923076923, 500, 1500, "AAEMonitor(Alarms)-UnAcknowledged"], "isController": true}, {"data": [0.43333333333333335, 500, 1500, "AAEMonitor(Alarms)-Isolated"], "isController": true}, {"data": [0.8518518518518519, 500, 1500, "AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false"], "isController": false}, {"data": [0.7909090909090909, 500, 1500, "AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 202, 0, 0.0, 679.2029702970297, 362, 5991, 439.5, 684.6000000000001, 2336.1499999999987, 5589.26, 0.2289608238962558, 1.898099708400822, 0.5957300559678865], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Acknowledged", 60, 0, 0.0, 782.9666666666666, 362, 5533, 482.0, 846.0, 4226.199999999996, 5533.0, 0.06268858816940964, 0.09373698885292421, 0.16385352171428214], "isController": true}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged-/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 95, 0, 0.0, 667.9578947368418, 366, 5991, 429.0, 732.600000000001, 2397.5999999999985, 5991.0, 0.10887478482904366, 1.3703304088276822, 0.28319755143474046], "isController": false}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isIsolated=true", 25, 0, 0.0, 663.6800000000001, 379, 5591, 448.0, 643.8000000000002, 4119.7999999999965, 5591.0, 0.03303600925008259, 0.07495431739345887, 0.08522387058143377], "isController": false}, {"data": ["AAEMonitor(Alarms)-UnAcknowledged", 104, 0, 0.0, 670.8269230769228, 366, 5991, 439.5, 750.0, 2359.75, 5938.950000000003, 0.10976739866041556, 1.3816554896100937, 0.2855234578999808], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated", 30, 0, 0.0, 1254.0333333333335, 778, 6056, 927.0, 2318.9000000000015, 4639.749999999998, 6056.0, 0.032310978085617635, 0.4801545972598137, 0.1673965301509892], "isController": true}, {"data": ["AAEMonitor(Alarms)-Isolated/alarms?limit=20&filter=typeId=4399&isAcknowledged=false&isIsolated=false", 27, 0, 0.0, 545.3333333333333, 374, 1897, 447.0, 901.5999999999997, 1622.9999999999986, 1897.0, 0.030880082346886256, 0.38881003566935435, 0.08031747691141991], "isController": false}, {"data": ["AAEMonitor(Alarms)-Acknowledged/alarms?limit=20&filter=typeId=4399&isAcknowledged=true&isIsolated=false&isActive=true", 55, 0, 0.0, 771.3999999999999, 362, 5533, 480.0, 743.9999999999999, 4421.7999999999965, 5533.0, 0.06279033394182876, 0.09386218420743186, 0.16411667450118786], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 202, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
