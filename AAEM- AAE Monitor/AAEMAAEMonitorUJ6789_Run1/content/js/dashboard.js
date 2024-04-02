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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18100890207715134, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.39090909090909093, 500, 1500, "AAEMonitor(Alarms)-Tickets-ON"], "isController": true}, {"data": [0.0, 500, 1500, "AAEMonitor(Alarms)-Events-ON-/alarms?limit=20&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.15454545454545454, 500, 1500, "AAEMonitor(Alarms)-Alarams-ON"], "isController": true}, {"data": [0.33, 500, 1500, "AAEMonitor(Alarms)-Tickets-ON/alarms?limit=20&isTicketRaised=false&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.07, 500, 1500, "AAEMonitor(Alarms)-Alarams-ON/alarms?limit=20&filter=typeId=4399&isIsolated=true"], "isController": false}, {"data": [0.03, 500, 1500, "AAEMonitor(Alarms)-Alerts-ON/alarms?limit=20&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.10185185185185185, 500, 1500, "AAEMonitor(Alarms)-Alerts-ON"], "isController": true}, {"data": [0.3076923076923077, 500, 1500, "AAEMonitor(Alarms)-Events-ON"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 180, 0, 0.0, 2696.7611111111128, 0, 64509, 1862.5, 3686.2000000000003, 4227.8, 62424.06, 0.29696207794264673, 2.455524515456876, 0.6928615704055842], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Tickets-ON", 55, 0, 0.0, 1436.6909090909091, 0, 5090, 966.0, 3032.8, 3659.6, 5090.0, 0.08374699272162499, 0.8811441623587721, 0.19779576487651124], "isController": true}, {"data": ["AAEMonitor(Alarms)-Events-ON-/alarms?limit=20&isIsolated=false&isActive=true", 10, 0, 0.0, 3017.2, 1933, 5095, 2845.5, 4949.1, 5095.0, 5095.0, 0.09505522708693752, 1.0972195157886733, 0.24492501627820765], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alarams-ON", 55, 0, 0.0, 2210.7454545454552, 0, 5753, 1889.0, 3761.9999999999995, 4020.799999999999, 5753.0, 0.08280389027731776, 0.20208148279184607, 0.19432302879693475], "isController": true}, {"data": ["AAEMonitor(Alarms)-Tickets-ON/alarms?limit=20&isTicketRaised=false&isIsolated=false&isActive=true", 50, 0, 0.0, 1580.3600000000001, 800, 5090, 988.0, 3046.3, 3669.1, 5090.0, 0.08383283732237917, 0.9702521141593663, 0.2177983663075827], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alarams-ON/alarms?limit=20&filter=typeId=4399&isIsolated=true", 50, 0, 0.0, 2431.82, 1225, 5753, 2134.5, 3847.0, 4085.549999999999, 5753.0, 0.08279132611834523, 0.22225590219363897, 0.21372289774194939], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alerts-ON/alarms?limit=20&filter=typeId=4399,4400&isIsolated=false&isActive=true", 50, 0, 0.0, 2563.84, 1369, 5754, 2132.5, 4202.3, 4360.049999999999, 5754.0, 0.08249436563482715, 1.0490560350196831, 0.21456913399064845], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alerts-ON", 54, 0, 0.0, 3485.055555555555, 0, 64509, 1995.5, 4179.5, 4617.75, 64509.0, 0.08103216977139924, 0.9541312315051574, 0.19515364787320566], "isController": true}, {"data": ["AAEMonitor(Alarms)-Events-ON", 13, 0, 0.0, 6544.538461538462, 0, 61935, 2415.0, 38615.39999999998, 61935.0, 61935.0, 0.08360128617363344, 0.6682073954983923, 0.14914087620578778], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 180, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
