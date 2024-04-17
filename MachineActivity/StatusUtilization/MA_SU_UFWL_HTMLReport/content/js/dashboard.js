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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9927310488058152, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834"], "isController": false}, {"data": [0.9782608695652174, 2000, 4000, "MA_SU_UFWL_UF4_Home"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlAAELogDetails?limit=10&sort="], "isController": false}, {"data": [0.98989898989899, 2000, 4000, "MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month"], "isController": true}, {"data": [0.98989898989899, 2000, 4000, "MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5"], "isController": false}, {"data": [0.9855072463768116, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlUtilisationStatusDetails"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF4_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF4_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_UFWL_UF6_Export-Excel/ufwlAAELogDetails?limit=-1&sort="], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 701, 0, 0.0, 278.84022824536385, 79, 5878, 165.0, 599.6000000000001, 644.0, 1182.5600000000031, 0.31434103625818477, 0.32275062587945985, 0.8165057287364657], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU_UFWL_UF6_Export-Excel", 25, 0, 0.0, 850.1999999999999, 761, 1217, 818.0, 958.8000000000001, 1144.3999999999999, 1217.0, 0.011536697311211179, 0.04339420537074792, 0.060669508289809215], "isController": true}, {"data": ["MA_SU_UFWL_UF6_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834", 25, 0, 0.0, 651.28, 574, 1014, 627.0, 759.2, 942.5999999999998, 1014.0, 0.011537671651709998, 0.021364973619113766, 0.03098360597812919], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home", 138, 0, 0.0, 1111.159420289856, 905, 6771, 992.5, 1136.4000000000003, 1372.7999999999997, 5829.149999999964, 0.06238125524646699, 0.25919439807287126, 0.6470642612816274], "isController": true}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlAAELogDetails?limit=10&sort=", 138, 0, 0.0, 195.33333333333334, 165, 248, 194.0, 212.10000000000002, 225.09999999999997, 243.70999999999984, 0.06244129161169118, 0.07406640441889781, 0.15879553251223036], "isController": false}, {"data": ["MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month", 99, 0, 0.0, 210.82828282828288, 116, 3262, 136.0, 165.0, 186.0, 3262.0, 0.04438954289980294, 0.023462843934886367, 0.11565950768521985], "isController": true}, {"data": ["MA_SU_UFWL_UF5_UtilHoursGraph-Week-Month/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5", 99, 0, 0.0, 210.82828282828288, 116, 3262, 136.0, 165.0, 186.0, 3262.0, 0.044393603554358174, 0.023464990262554535, 0.11567008795426652], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlUtilisationStatusDetails", 138, 0, 0.0, 204.49999999999991, 79, 5878, 102.0, 166.0, 238.69999999999771, 4880.769999999962, 0.062413220748325476, 0.03803747308995192, 0.16037024777596365], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834", 138, 0, 0.0, 598.4855072463768, 525, 945, 578.0, 667.6, 756.05, 939.1499999999997, 0.06242962530010328, 0.11570810095639471, 0.16577877041573155], "isController": false}, {"data": ["MA_SU_UFWL_UF4_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10", 138, 0, 0.0, 112.84057971014492, 97, 190, 110.5, 126.10000000000001, 129.14999999999995, 178.29999999999956, 0.06244360844418582, 0.03159431301057831, 0.16264537935397108], "isController": false}, {"data": ["MA_SU_UFWL_UF6_Export-Excel/ufwlAAELogDetails?limit=-1&sort=", 25, 0, 0.0, 198.92000000000002, 180, 242, 197.0, 223.80000000000004, 240.5, 242.0, 0.011540307987739576, 0.02203793111705565, 0.029697810543917794], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 701, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
