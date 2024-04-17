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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9975124378109452, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF1_Home-/tcmsUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF1_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422174"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF1_Home-/tcmsAAELogDetails?limit=10&sort="], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF2_UtilHoursGraph-Week-Month/tcmsUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF2"], "isController": false}, {"data": [0.9826388888888888, 2000, 4000, "MA_SU_TCMS_UF1_Home"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF3_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=1142217"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF2_UtilHoursGraph-Week-Month"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF3_ExportExcel"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF1_Home-/tcmsUtilisationStatusDetails"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU_TCMS_UF3_Export-Excel/tcmsAAELogDetails?limit=-1&sort="], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 732, 0, 0.0, 396.2732240437158, 163, 1646, 421.5, 594.0, 654.1000000000001, 859.0299999999996, 0.3121877323015785, 0.36472880503321686, 0.8146648427994028], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU_TCMS_UF1_Home-/tcmsUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10", 144, 0, 0.0, 433.05555555555554, 402, 643, 424.0, 466.5, 478.75, 601.150000000001, 0.06304601571071686, 0.03220881114040611, 0.16421995769787476], "isController": false}, {"data": ["MA_SU_TCMS_UF1_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422174", 144, 0, 0.0, 617.4027777777774, 524, 888, 589.0, 740.5, 774.25, 876.7500000000002, 0.06304253795248344, 0.19127683015442795, 0.1693195095695508], "isController": false}, {"data": ["MA_SU_TCMS_UF1_Home-/tcmsAAELogDetails?limit=10&sort=", 144, 0, 0.0, 197.10416666666666, 163, 354, 192.0, 218.5, 242.75, 346.3500000000002, 0.0630524478142475, 0.058835866678883075, 0.1622641848030027], "isController": false}, {"data": ["MA_SU_TCMS_UF2_UtilHoursGraph-Week-Month/tcmsUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF2", 102, 0, 0.0, 461.50000000000006, 428, 533, 452.5, 505.7, 524.7, 532.88, 0.043572277437505816, 0.023496524149721178, 0.1135341334061389], "isController": false}, {"data": ["MA_SU_TCMS_UF1_Home", 144, 0, 0.0, 1554.0416666666667, 1357, 2575, 1487.0, 1767.5, 1888.5, 2491.300000000002, 0.06297978348949988, 0.32043809396168205, 0.6571063296103826], "isController": true}, {"data": ["MA_SU_TCMS_UF3_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=1142217", 27, 0, 0.0, 508.6666666666666, 414, 1646, 447.0, 619.6, 1239.5999999999979, 1646.0, 0.011617345298912143, 0.008737800039455948, 0.03118884086216192], "isController": false}, {"data": ["MA_SU_TCMS_UF2_UtilHoursGraph-Week-Month", 102, 0, 0.0, 461.50000000000006, 428, 533, 452.5, 505.7, 524.7, 532.88, 0.043572277437505816, 0.023496524149721178, 0.1135341334061389], "isController": true}, {"data": ["MA_SU_TCMS_UF3_ExportExcel", 27, 0, 0.0, 711.7407407407409, 589, 1885, 645.0, 829.0, 1472.1999999999978, 1885.0, 0.011616340663387703, 0.02905219574114835, 0.061077801597849174], "isController": true}, {"data": ["MA_SU_TCMS_UF1_Home-/tcmsUtilisationStatusDetails", 144, 0, 0.0, 306.4791666666667, 212, 1401, 251.0, 538.0, 609.25, 1255.2000000000037, 0.06301897658932547, 0.03843253246899598, 0.16193145203818252], "isController": false}, {"data": ["MA_SU_TCMS_UF3_Export-Excel/tcmsAAELogDetails?limit=-1&sort=", 27, 0, 0.0, 203.0740740740741, 170, 320, 197.0, 240.4, 290.39999999999986, 320.0, 0.011624587811490518, 0.02032957428606733, 0.029912879768825697], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 732, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
