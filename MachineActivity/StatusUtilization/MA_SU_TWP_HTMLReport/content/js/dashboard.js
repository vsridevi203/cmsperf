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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9994350282485875, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU_TWP_UF11_UtilHoursGraph-Week-Month"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF10_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175"], "isController": false}, {"data": [0.99609375, 2000, 4000, "MA_SU_TWP_UF10_Home"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF10_Home-/twpAAELogDetails?limit=10&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF11_UtilHoursGraph-Week-Month-/twpUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF12_Export-Excel/twpAAELogDetails?limit=-1&sort=-"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF10_Home-/twpUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF12_Export-Excel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF12_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TWP_UF10_Home-/twpUtilisationStatusDetails"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 646, 0, 0.0, 252.85603715170282, 76, 1641, 143.5, 599.3000000000001, 634.0, 808.4299999999992, 0.3230728529283353, 0.3222284242284135, 0.843054366572162], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU_TWP_UF11_UtilHoursGraph-Week-Month", 88, 0, 0.0, 130.63636363636363, 95, 1171, 112.5, 144.20000000000002, 160.2, 1171.0, 0.04414838271430277, 0.023425412498908834, 0.11501939267879342], "isController": true}, {"data": ["MA_SU_TWP_UF10_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175", 128, 0, 0.0, 606.9296874999995, 534, 1005, 587.5, 682.7000000000002, 775.1, 983.2499999999995, 0.06406114636420464, 0.10837883822608681, 0.17210421487935235], "isController": false}, {"data": ["MA_SU_TWP_UF10_Home", 128, 0, 0.0, 1030.125, 915, 2142, 1002.5, 1107.0000000000002, 1229.3999999999999, 1930.5899999999956, 0.06400710478863153, 0.2514864110853805, 0.6678265701555373], "isController": true}, {"data": ["MA_SU_TWP_UF10_Home-/twpAAELogDetails?limit=10&sort=", 128, 0, 0.0, 208.46093750000009, 176, 288, 207.0, 227.10000000000002, 235.55, 280.16999999999985, 0.06407625073837867, 0.07155634345496141, 0.16488224502783314], "isController": false}, {"data": ["MA_SU_TWP_UF11_UtilHoursGraph-Week-Month-/twpUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10", 88, 0, 0.0, 130.63636363636363, 95, 1171, 112.5, 144.20000000000002, 160.2, 1171.0, 0.04415285719159731, 0.02342778668500348, 0.11503104999508297], "isController": false}, {"data": ["MA_SU_TWP_UF12_Export-Excel/twpAAELogDetails?limit=-1&sort=-", 23, 0, 0.0, 210.08695652173913, 187, 288, 204.0, 241.20000000000005, 280.39999999999986, 288.0, 0.011774468753887496, 0.02857078442662689, 0.030294560253028215], "isController": false}, {"data": ["MA_SU_TWP_UF10_Home-/twpUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10", 128, 0, 0.0, 88.92187500000001, 76, 129, 87.0, 100.0, 106.55, 126.67999999999995, 0.06408048508927212, 0.032430380996031016, 0.166896633890917], "isController": false}, {"data": ["MA_SU_TWP_UF12_Export-Excel", 23, 0, 0.0, 869.2608695652173, 764, 1929, 808.0, 910.6, 1726.199999999997, 1929.0, 0.011764579510910624, 0.04843997679564568, 0.06187043914745673], "isController": true}, {"data": ["MA_SU_TWP_UF12_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175", 23, 0, 0.0, 659.1739130434783, 559, 1641, 605.0, 688.0, 1451.5999999999972, 1641.0, 0.011765951689002364, 0.019895508917056694, 0.03160500881679032], "isController": false}, {"data": ["MA_SU_TWP_UF10_Home-/twpUtilisationStatusDetails", 128, 0, 0.0, 125.81250000000003, 96, 1170, 113.0, 143.10000000000002, 153.1, 884.3499999999939, 0.06404566455883046, 0.039350322404874676, 0.1645567821106449], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 646, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
