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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.49135802469135803, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5422077922077922, 500, 1500, "AAEMonitor(Alarms)-Tickets-ON"], "isController": true}, {"data": [0.5033333333333333, 500, 1500, "AAEMonitor(Alarms)-Events-ON-/alarms?limit=20&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.474025974025974, 500, 1500, "AAEMonitor(Alarms)-Alarams-ON"], "isController": true}, {"data": [0.5233333333333333, 500, 1500, "AAEMonitor(Alarms)-Tickets-ON/alarms?limit=20&isTicketRaised=false&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.4463087248322148, 500, 1500, "AAEMonitor(Alarms)-Alerts-ON/alarms?limit=20&filter=typeId=4399,4400&isIsolated=false&isActive=true"], "isController": false}, {"data": [0.4642857142857143, 500, 1500, "AAEMonitor(Alarms)-Alerts-ON"], "isController": true}, {"data": [0.5193548387096775, 500, 1500, "AAEMonitor(Alarms)-Events-ON"], "isController": true}, {"data": [0.4563758389261745, 500, 1500, "AAEMonitor(Alarms)-Alarams-ON//alarms?limit=20&filter=typeId=4399&isIsolated=false&isActive=true"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 618, 0, 0.0, 914.0954692556634, 0, 3302, 952.0, 1375.0, 1723.9499999999973, 2378.1099999999983, 0.3379052607693632, 3.9805805926943023, 0.8486444874761813], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEMonitor(Alarms)-Tickets-ON", 154, 0, 0.0, 669.4545454545452, 0, 2180, 576.0, 992.0, 1496.25, 2106.8499999999985, 0.08229388321322345, 0.9232992118757555, 0.2070518610441063], "isController": true}, {"data": ["AAEMonitor(Alarms)-Events-ON-/alarms?limit=20&isIsolated=false&isActive=true", 150, 0, 0.0, 714.8733333333333, 470, 3113, 574.0, 1056.9, 1566.6, 2663.180000000008, 0.08201731987082819, 0.9505011762308886, 0.21159667576284308], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alarams-ON", 154, 0, 0.0, 1127.4740259740256, 0, 3302, 1046.0, 1448.5, 1869.25, 2776.199999999989, 0.08162772034979068, 1.0077474611923796, 0.20521532723439984], "isController": true}, {"data": ["AAEMonitor(Alarms)-Tickets-ON/alarms?limit=20&isTicketRaised=false&isIsolated=false&isActive=true", 150, 0, 0.0, 705.4933333333335, 459, 2728, 582.5, 1026.4, 1535.6999999999998, 2448.520000000005, 0.08205312228540922, 0.9515074509021467, 0.2133712383429864], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alerts-ON/alarms?limit=20&filter=typeId=4399,4400&isIsolated=false&isActive=true", 149, 0, 0.0, 1196.1409395973149, 903, 3018, 1079.0, 1614.0, 2002.5, 2780.5, 0.08152269066461237, 1.0401655440654765, 0.21222743244012185], "isController": false}, {"data": ["AAEMonitor(Alarms)-Alerts-ON", 154, 0, 0.0, 1157.3051948051946, 0, 3018, 1072.0, 1612.5, 1999.25, 2756.7499999999945, 0.08156978400956803, 1.0069753007091276, 0.20545554870510616], "isController": true}, {"data": ["AAEMonitor(Alarms)-Events-ON", 155, 0, 0.0, 691.8129032258065, 0, 3113, 572.0, 1056.4, 1564.6, 2619.079999999998, 0.08204713422593558, 0.9201742216307477, 0.2048454134394794], "isController": true}, {"data": ["AAEMonitor(Alarms)-Alarams-ON//alarms?limit=20&filter=typeId=4399&isIsolated=false&isActive=true", 149, 0, 0.0, 1165.3087248322145, 892, 3302, 1052.0, 1455.0, 1885.5, 2824.0, 0.08158549639846577, 1.0410257151735334, 0.21199203275192258], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 618, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
