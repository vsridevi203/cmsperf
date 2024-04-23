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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6583629893238434, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.6759259259259259, 2000, 4000, "MA_ActivityLog_UF5_Toggle_DataError_ON-/cms/activityLogDetails?limit=25&dataError=true"], "isController": false}, {"data": [0.6759259259259259, 2000, 4000, "MA_ActivityLog_UF5_Toggle_DataError_ON"], "isController": true}, {"data": [0.7741935483870968, 2000, 4000, "MA_ActivityLog_UF1_Home"], "isController": true}, {"data": [0.5964912280701754, 2000, 4000, "MA_ActivityLog_UF4_Toggle_AAEExists_ON-/cms/activityLogDetails?limit=25&aaeExists=true"], "isController": false}, {"data": [0.5614035087719298, 2000, 4000, "MA_ActivityLog_UF3_ApplyFilter"], "isController": true}, {"data": [0.6764705882352942, 2000, 4000, "MA_ActivityLog_UF2_SelectUnits-/cms/activityLogDetails?limit=25&unitNumber=R01"], "isController": false}, {"data": [0.6764705882352942, 2000, 4000, "MA_ActivityLog_UF2_SelectUnits"], "isController": true}, {"data": [0.5964912280701754, 2000, 4000, "MA_ActivityLog_UF4_Toggle_AAEExists_ON"], "isController": true}, {"data": [0.5614035087719298, 2000, 4000, "MA_ActivityLog_UF3_ApplyFilter-/cms/activityLogDetails?limit=25&fleetType=Long%20Regional"], "isController": false}, {"data": [0.7741935483870968, 2000, 4000, "MA_ActivityLog_UF1_Home-/cms/activityLogDetails?limit=25"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 285, 0, 0.0, 2381.108771929827, 1762, 4704, 2070.0, 3819.4, 4058.0, 4576.14, 0.13255912602140296, 0.30348608844298375, 0.3422182080773625], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_ActivityLog_UF5_Toggle_DataError_ON-/cms/activityLogDetails?limit=25&dataError=true", 54, 0, 0.0, 2520.7222222222226, 1823, 4561, 2149.0, 3947.5, 4431.75, 4561.0, 0.025116477665172235, 0.05366230657405198, 0.06483109037955183], "isController": false}, {"data": ["MA_ActivityLog_UF5_Toggle_DataError_ON", 54, 0, 0.0, 2520.7222222222226, 1823, 4561, 2149.0, 3947.5, 4431.75, 4561.0, 0.025114012968132177, 0.05365704065540133, 0.06482472846054821], "isController": true}, {"data": ["MA_ActivityLog_UF1_Home", 62, 0, 0.0, 2240.2258064516136, 1762, 4399, 1967.5, 3463.0000000000005, 3878.249999999998, 4399.0, 0.02925918112990463, 0.07424849032063816, 0.07509601479924663], "isController": true}, {"data": ["MA_ActivityLog_UF4_Toggle_AAEExists_ON-/cms/activityLogDetails?limit=25&aaeExists=true", 57, 0, 0.0, 2381.5263157894733, 1826, 4576, 2079.0, 3916.2000000000003, 4061.7, 4576.0, 0.027156694125101837, 0.05799132251313765, 0.0700957042695564], "isController": false}, {"data": ["MA_ActivityLog_UF3_ApplyFilter", 57, 0, 0.0, 2410.8070175438593, 1842, 4704, 2105.0, 3873.4000000000005, 4043.0999999999995, 4704.0, 0.027148092846477533, 0.06656185106532451, 0.07036792363527253], "isController": true}, {"data": ["MA_ActivityLog_UF2_SelectUnits-/cms/activityLogDetails?limit=25&unitNumber=R01", 51, 0, 0.0, 2300.78431372549, 1855, 4496, 2036.0, 3214.0000000000027, 4151.599999999999, 4496.0, 0.0241305890702626, 0.05193547433167731, 0.062472738496569674], "isController": false}, {"data": ["MA_ActivityLog_UF2_SelectUnits", 51, 0, 0.0, 2300.78431372549, 1855, 4496, 2036.0, 3214.0000000000027, 4151.599999999999, 4496.0, 0.024128031852786832, 0.05192997051649127, 0.062466118004290055], "isController": true}, {"data": ["MA_ActivityLog_UF4_Toggle_AAEExists_ON", 57, 0, 0.0, 2381.59649122807, 1826, 4577, 2079.0, 3916.2000000000003, 4061.9, 4577.0, 0.027154003214652875, 0.05798557625201393, 0.07008875860591347], "isController": true}, {"data": ["MA_ActivityLog_UF3_ApplyFilter-/cms/activityLogDetails?limit=25&fleetType=Long%20Regional", 57, 0, 0.0, 2410.8070175438593, 1842, 4704, 2105.0, 3873.4000000000005, 4043.0999999999995, 4704.0, 0.02715080845104638, 0.06656850920031342, 0.07037496248901463], "isController": false}, {"data": ["MA_ActivityLog_UF1_Home-/cms/activityLogDetails?limit=25", 62, 0, 0.0, 2240.2258064516136, 1762, 4399, 1967.5, 3463.0000000000005, 3878.249999999998, 4399.0, 0.029262426383758786, 0.07425672552032843, 0.075104344001297], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 285, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
