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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9989669421487604, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU_SIM_UF14_UtilHoursGraph-Week-Month-/simulatorUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10&simulatorNo=1"], "isController": false}, {"data": [0.9928057553956835, 2000, 4000, "MA_SU_SIM_UF13_Home"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF15_Export-Excel/simulatorAAELogDetails?limit=-1&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF13_Home-/simulatorAAELogDetails?limit=10&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF13_Home-/simulatorUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10&simulatorNo=1"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF13_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF14_UtilHoursGraph-Week-Month"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF15_Export-Excel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF15_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_SIM_UF13_Home-/simulatorUtilisationStatusDetails?simulatorNo=1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 705, 0, 0.0, 271.2737588652482, 81, 1810, 135.0, 721.0, 761.0999999999998, 867.7599999999998, 0.3167666615894138, 0.49250169012424894, 0.829671789440707], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU_SIM_UF14_UtilHoursGraph-Week-Month-/simulatorUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10&simulatorNo=1", 99, 0, 0.0, 136.8686868686869, 99, 1219, 116.0, 160.0, 184.0, 1219.0, 0.04448212694659853, 0.02339023774011924, 0.11677172620531963], "isController": false}, {"data": ["MA_SU_SIM_UF13_Home", 139, 0, 0.0, 1105.9280575539567, 989, 2168, 1076.0, 1180.0, 1272.0, 2107.599999999999, 0.06288471648041029, 0.3477718861999264, 0.6583663471025981], "isController": true}, {"data": ["MA_SU_SIM_UF15_Export-Excel/simulatorAAELogDetails?limit=-1&sort=", 25, 0, 0.0, 153.8, 130, 205, 151.0, 175.60000000000002, 196.89999999999998, 205.0, 0.011543004154558055, 0.011552473025153592, 0.029769227355165313], "isController": false}, {"data": ["MA_SU_SIM_UF13_Home-/simulatorAAELogDetails?limit=10&sort=", 139, 0, 0.0, 147.60431654676256, 119, 383, 143.0, 166.0, 178.0, 362.5999999999997, 0.06295090282463871, 0.05783649578591258, 0.1623673863090844], "isController": false}, {"data": ["MA_SU_SIM_UF13_Home-/simulatorUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10&simulatorNo=1", 139, 0, 0.0, 93.46762589928052, 81, 132, 91.0, 106.0, 118.0, 128.39999999999995, 0.06295070325898962, 0.03175221159633473, 0.16519738880822543], "isController": false}, {"data": ["MA_SU_SIM_UF13_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted", 139, 0, 0.0, 724.3453237410071, 663, 987, 709.0, 803.0, 819.0, 939.3999999999993, 0.06293474210565157, 0.22190094289487133, 0.16847167435730723], "isController": false}, {"data": ["MA_SU_SIM_UF14_UtilHoursGraph-Week-Month", 99, 0, 0.0, 136.8686868686869, 99, 1219, 116.0, 160.0, 184.0, 1219.0, 0.04447892934274968, 0.023388556329643678, 0.1167633320536281], "isController": true}, {"data": ["MA_SU_SIM_UF15_Export-Excel", 25, 0, 0.0, 958.9599999999999, 838, 1988, 896.0, 1107.4000000000005, 1765.3999999999996, 1988.0, 0.011532461110234643, 0.1270174454998953, 0.06061029092247695], "isController": true}, {"data": ["MA_SU_SIM_UF15_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted", 25, 0, 0.0, 805.16, 693, 1810, 736.0, 947.2000000000005, 1588.5999999999995, 1810.0, 0.011534121159945043, 0.11549214638806689, 0.030872697270381024], "isController": false}, {"data": ["MA_SU_SIM_UF13_Home-/simulatorUtilisationStatusDetails?simulatorNo=1", 139, 0, 0.0, 140.51079136690646, 99, 1195, 120.0, 164.0, 182.0, 1082.1999999999985, 0.06291955802405427, 0.03657296561038761, 0.1628978940620233], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 705, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
