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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24050632911392406, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3, 500, 1500, "MA_ActivityLog_UF6_View TCMS/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)"], "isController": false}, {"data": [0.3, 500, 1500, "MA_ActivityLog_UF6_View TCMS"], "isController": true}, {"data": [0.19117647058823528, 500, 1500, "MA_ActivityLog_UF9_View WeighBridge/cms/activityLogDetails?limit=25&machineDescription=Weighbridge"], "isController": false}, {"data": [0.45588235294117646, 500, 1500, "MA_ActivityLog_UF7_View TCMS-Upload"], "isController": true}, {"data": [0.45588235294117646, 500, 1500, "MA_ActivityLog_UF7_View TCMS-Upload/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)"], "isController": false}, {"data": [0.16176470588235295, 500, 1500, "MA_ActivityLog_UF8_View UFWL"], "isController": true}, {"data": [0.19117647058823528, 500, 1500, "MA_ActivityLog_UF9_View WeighBridge"], "isController": true}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF10_Export to csv/cms/activityLogDetails?limit=-1"], "isController": false}, {"data": [0.16176470588235295, 500, 1500, "MA_ActivityLog_UF8_View UFWL/cms/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)"], "isController": false}, {"data": [0.0, 500, 1500, "MA_ActivityLog_UF10_Export to csv"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 158, 0, 0.0, 1640.82911392405, 1081, 3920, 1505.5, 2356.1, 2444.8499999999995, 3305.8099999999963, 0.07080086986486443, 0.13748782199832318, 0.18396227055813044], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_ActivityLog_UF6_View TCMS/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)", 35, 0, 0.0, 1625.3999999999999, 1353, 2864, 1469.0, 2390.7999999999997, 2631.199999999999, 2864.0, 0.01632330212007048, 0.03525815039964107, 0.042581319339055505], "isController": false}, {"data": ["MA_ActivityLog_UF6_View TCMS", 35, 0, 0.0, 1625.3999999999999, 1353, 2864, 1469.0, 2390.7999999999997, 2631.199999999999, 2864.0, 0.016321414348481784, 0.035254072834078366, 0.0425763948572156], "isController": true}, {"data": ["MA_ActivityLog_UF9_View WeighBridge/cms/activityLogDetails?limit=25&machineDescription=Weighbridge", 34, 0, 0.0, 1656.5000000000005, 1396, 2498, 1543.0, 2229.0, 2427.5, 2498.0, 0.016753918445867103, 0.03593267015944803, 0.04346125052725567], "isController": false}, {"data": ["MA_ActivityLog_UF7_View TCMS-Upload", 34, 0, 0.0, 1227.5882352941176, 1081, 1695, 1197.0, 1462.0, 1642.5, 1695.0, 0.01703237001922153, 0.011564947933547707, 0.044465855013703544], "isController": true}, {"data": ["MA_ActivityLog_UF7_View TCMS-Upload/cms/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)", 34, 0, 0.0, 1227.5882352941176, 1081, 1695, 1197.0, 1462.0, 1642.5, 1695.0, 0.01703237855162664, 0.011564953727035093, 0.044465877288976344], "isController": false}, {"data": ["MA_ActivityLog_UF8_View UFWL", 34, 0, 0.0, 1692.8235294117646, 1423, 2879, 1548.0, 2371.5, 2597.0, 2879.0, 0.016753406608134864, 0.015365148966117712, 0.04357396681371887], "isController": true}, {"data": ["MA_ActivityLog_UF9_View WeighBridge", 34, 0, 0.0, 1656.5000000000005, 1396, 2498, 1543.0, 2229.0, 2427.5, 2498.0, 0.016753918445867103, 0.03593267015944803, 0.04346125052725567], "isController": true}, {"data": ["MA_ActivityLog_UF10_Export to csv/cms/activityLogDetails?limit=-1", 21, 0, 0.0, 2226.047619047619, 1854, 3920, 2049.0, 2471.0, 3775.999999999998, 3920.0, 0.009939327505101006, 0.0492376646733582, 0.025481544147889622], "isController": false}, {"data": ["MA_ActivityLog_UF8_View UFWL/cms/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)", 34, 0, 0.0, 1692.8235294117646, 1423, 2879, 1548.0, 2371.5, 2597.0, 2879.0, 0.016753406608134864, 0.015365148966117712, 0.04357396681371887], "isController": false}, {"data": ["MA_ActivityLog_UF10_Export to csv", 21, 0, 0.0, 2226.047619047619, 1854, 3920, 2049.0, 2471.0, 3775.999999999998, 3920.0, 0.009939327505101006, 0.0492376646733582, 0.025481544147889622], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 158, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
