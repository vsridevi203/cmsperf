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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9078947368421053, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_ActivityLog_UF7_ViewTCMS_Upload"], "isController": true}, {"data": [0.9, 2000, 4000, "MA_ActivityLog_UF6_ViewTCMS-/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)"], "isController": false}, {"data": [0.9411764705882353, 2000, 4000, "MA_ActivityLog_UF9_ViewWeighBridge"], "isController": true}, {"data": [0.9411764705882353, 2000, 4000, "MA_ActivityLog_UF9_ViewWeighBridge-/cms/activityLogDetails?limit=25&machineDescription=Weighbridge"], "isController": false}, {"data": [0.9, 2000, 4000, "MA_ActivityLog_UF6_ViewTCMS"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_ActivityLog_UF7_ViewTCMS_Upload-/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)"], "isController": false}, {"data": [0.9411764705882353, 2000, 4000, "MA_ActivityLog_UF8_ViewUFWL"], "isController": true}, {"data": [0.5666666666666667, 2000, 4000, "MA_ActivityLog_UF10_ExportToCSV-/cms/activityLogDetails?limit=-1"], "isController": false}, {"data": [0.9411764705882353, 2000, 4000, "MA_ActivityLog_UF8_ViewUFWL-/cms/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)"], "isController": false}, {"data": [0.5666666666666667, 2000, 4000, "MA_ActivityLog_UF10_ExportToCsv"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 152, 0, 0.0, 1677.9407894736842, 1043, 3808, 1543.5, 2358.600000000001, 2762.2999999999997, 3805.35, 0.06792009022647776, 0.12384873771405999, 0.17656919426218226], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_ActivityLog_UF7_ViewTCMS_Upload", 34, 0, 0.0, 1268.1764705882351, 1043, 1700, 1214.0, 1644.0, 1664.0, 1700.0, 0.017035416631176217, 0.011567016577464548, 0.044472340809042], "isController": true}, {"data": ["MA_ActivityLog_UF6_ViewTCMS-/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)", 35, 0, 0.0, 1757.0857142857144, 1381, 2883, 1550.0, 2666.7999999999997, 2826.9999999999995, 2883.0, 0.01631921503643148, 0.035283927822909476, 0.04257065768418216], "isController": false}, {"data": ["MA_ActivityLog_UF9_ViewWeighBridge", 34, 0, 0.0, 1644.5, 1370, 3428, 1530.5, 2227.0, 2594.75, 3428.0, 0.016747118510491578, 0.03593925090508324, 0.04344216779750763], "isController": true}, {"data": ["MA_ActivityLog_UF9_ViewWeighBridge-/cms/activityLogDetails?limit=25&machineDescription=Weighbridge", 34, 0, 0.0, 1644.5, 1370, 3428, 1530.5, 2227.0, 2594.75, 3428.0, 0.016747126759495006, 0.035939268607412374, 0.043442189195492656], "isController": false}, {"data": ["MA_ActivityLog_UF6_ViewTCMS", 35, 0, 0.0, 1757.0857142857144, 1381, 2883, 1550.0, 2666.7999999999997, 2826.9999999999995, 2883.0, 0.016317244530226527, 0.03527966737297025, 0.04256551737903094], "isController": true}, {"data": ["MA_ActivityLog_UF7_ViewTCMS_Upload-/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)", 34, 0, 0.0, 1268.1764705882351, 1043, 1700, 1214.0, 1644.0, 1664.0, 1700.0, 0.01703543370210037, 0.01156702816859067, 0.044472385374078084], "isController": false}, {"data": ["MA_ActivityLog_UF8_ViewUFWL", 34, 0, 0.0, 1655.0882352941182, 1401, 2735, 1572.5, 2205.0, 2387.0, 2735.0, 0.016744644176311253, 0.015362403041122876, 0.04355213848190101], "isController": true}, {"data": ["MA_ActivityLog_UF10_ExportToCSV-/cms/activityLogDetails?limit=-1", 15, 0, 0.0, 2549.666666666666, 1913, 3808, 2318.0, 3805.0, 3808.0, 3808.0, 0.007078313039809848, 0.03503626706404316, 0.01814785454562185], "isController": false}, {"data": ["MA_ActivityLog_UF8_ViewUFWL-/cms/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)", 34, 0, 0.0, 1655.0882352941182, 1401, 2735, 1572.5, 2205.0, 2387.0, 2735.0, 0.01674465242287733, 0.015362410606949326, 0.04355215993088398], "isController": false}, {"data": ["MA_ActivityLog_UF10_ExportToCsv", 15, 0, 0.0, 2549.666666666666, 1913, 3808, 2318.0, 3805.0, 3808.0, 3808.0, 0.007078313039809848, 0.03503626706404316, 0.01814785454562185], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 152, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
