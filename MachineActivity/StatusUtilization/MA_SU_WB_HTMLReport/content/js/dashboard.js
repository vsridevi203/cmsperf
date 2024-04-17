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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9963842975206612, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU WB_UF7_Home-/wbAAELogDetails?limit=10&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_UF9_Export_Excel/wbAAELogDetails?limit=-1&sort=undefined"], "isController": false}, {"data": [0.9949494949494949, 2000, 4000, "MA_SU WB_UF8_UtilHoursGraph-Week-Month-/wbUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_UF7_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_UF9_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_UF7_Home-/wbUtilisationStatusDetails"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_WB_UF9_Export-Excel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU WB_UF7_Home-/wbUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10"], "isController": false}, {"data": [0.9820143884892086, 2000, 4000, "MA_SU_WB_UF7_Home"], "isController": true}, {"data": [0.9949494949494949, 2000, 4000, "MA_SU_WB_UF8_UtilHoursGraph-Week-Month"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 705, 0, 0.0, 290.15177304964516, 87, 3213, 168.0, 608.0, 658.6999999999999, 1202.5399999999945, 0.3167316528135879, 0.3216691777758609, 0.8258008305726015], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU WB_UF7_Home-/wbAAELogDetails?limit=10&sort=", 139, 0, 0.0, 291.47482014388487, 221, 1662, 263.0, 299.0, 344.0, 1485.1999999999975, 0.06289145974697725, 0.060582340700230795, 0.16165998402489054], "isController": false}, {"data": ["MA_SU WB_UF9_Export_Excel/wbAAELogDetails?limit=-1&sort=undefined", 25, 0, 0.0, 258.00000000000006, 228, 284, 260.0, 276.6, 282.5, 284.0, 0.011543505162255508, 0.013117209576953623, 0.0297700685280184], "isController": false}, {"data": ["MA_SU WB_UF8_UtilHoursGraph-Week-Month-/wbUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10", 99, 0, 0.0, 191.82828282828282, 130, 3213, 149.0, 171.0, 196.0, 3213.0, 0.044477210820631496, 0.023378877969134612, 0.11575938210821081], "isController": false}, {"data": ["MA_SU WB_UF7_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437", 139, 0, 0.0, 610.0287769784169, 533, 1208, 587.0, 695.0, 748.0, 1091.5999999999983, 0.06288215612508391, 0.1328293656502377, 0.16882305597439295], "isController": false}, {"data": ["MA_SU WB_UF9_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437", 25, 0, 0.0, 673.0399999999998, 585, 1566, 616.0, 806.8000000000004, 1378.1999999999996, 1566.0, 0.011536510980681881, 0.024306437217384323, 0.03096877230872811], "isController": false}, {"data": ["MA_SU WB_UF7_Home-/wbUtilisationStatusDetails", 139, 0, 0.0, 137.94244604316557, 87, 1448, 113.0, 149.0, 182.0, 1313.599999999998, 0.06286699740436189, 0.03844561405452785, 0.16135197202237705], "isController": false}, {"data": ["MA_SU_WB_UF9_Export-Excel", 25, 0, 0.0, 931.0400000000002, 828, 1839, 876.0, 1064.6000000000006, 1648.7999999999995, 1839.0, 0.011534461742035915, 0.037409052931875623, 0.060710017345523566], "isController": true}, {"data": ["MA_SU WB_UF7_Home-/wbUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10", 139, 0, 0.0, 128.10791366906483, 110, 350, 122.0, 142.0, 157.0, 337.99999999999983, 0.06289544379070386, 0.031833925089716504, 0.16363747498888018], "isController": false}, {"data": ["MA_SU_WB_UF7_Home", 139, 0, 0.0, 1167.5539568345325, 993, 3884, 1091.0, 1258.0, 1539.0, 3278.7999999999915, 0.0628324412482772, 0.2634763579378845, 0.6549347035608365], "isController": true}, {"data": ["MA_SU_WB_UF8_UtilHoursGraph-Week-Month", 99, 0, 0.0, 191.82828282828282, 130, 3213, 149.0, 171.0, 196.0, 3213.0, 0.04447315483575929, 0.023376745992474603, 0.11574882572902283], "isController": true}]}, function(index, item){
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
