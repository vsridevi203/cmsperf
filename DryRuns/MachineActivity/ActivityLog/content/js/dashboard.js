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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.0, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 2000, 4000, "MA_AactivityLog_Machine_AAE_Exists-UF5"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View TCMS-Upload-UF7"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_DataError_ON/activityLogDetails?limit=25&dataError=true-UF5"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_AactivityLog_Unit_Select-/activityLogDetails?limit=25&unitNumber=R01-UF2"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View TCMS-UF6"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_Home-/activityLogDetails?limit=25-UF1"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_ApplyFilter-/activityLogDetails?limit=25&fleetType=Long%20Regional-UF3"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_ApplyFilter-UF3"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View WeighBridge-UF9"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View WeighBridge/activityLogDetails?limit=25&machineDescription=Weighbridge-UF9"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_Export csv-UF10"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_AactivityLog_AAE_Exists-UF4"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View UFWL-UF8"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_AAE_Exists/activityLogDetails?limit=25&aaeExists=true-UF4"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_Home-UF1"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_AactivityLog_Unit_Select-UF2"], "isController": true}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View TCMS/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)-UF6"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View TCMS-Upload/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)-UF7"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_View UFWL/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)-UF8"], "isController": false}, {"data": [0.0, 2000, 4000, "MA_ActivityLog_Export csv/activityLogDetails?limit=-1-UF10"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 324, 0, 0.0, 7562.858024691361, 4631, 20979, 6429.0, 11069.5, 14177.25, 18955.75, 0.15689145726015216, 0.27902690948767195, 0.40640664177467484], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_AactivityLog_Machine_AAE_Exists-UF5", 31, 0, 0.0, 7989.806451612904, 5537, 20979, 6756.0, 12789.000000000002, 17477.999999999993, 20979.0, 0.015452360372970134, 0.009904036168991001, 0.03987997971005391], "isController": true}, {"data": ["MA_ActivityLog_View TCMS-Upload-UF7", 31, 0, 0.0, 6870.67741935484, 4631, 15336, 5356.0, 9826.800000000001, 14916.599999999999, 15336.0, 0.016237779761231308, 0.011023316338663516, 0.04243030473205568], "isController": true}, {"data": ["MA_ActivityLog_DataError_ON/activityLogDetails?limit=25&dataError=true-UF5", 31, 0, 0.0, 7989.774193548388, 5536, 20979, 6756.0, 12789.000000000002, 17477.999999999993, 20979.0, 0.015454555878439448, 0.009905443356310767, 0.03988564594559697], "isController": false}, {"data": ["MA_AactivityLog_Unit_Select-/activityLogDetails?limit=25&unitNumber=R01-UF2", 40, 0, 0.0, 7077.724999999999, 5104, 16923, 5998.0, 11010.3, 12931.349999999991, 16923.0, 0.020856873356543557, 0.04410342705152117, 0.05399058305650179], "isController": false}, {"data": ["MA_ActivityLog_View TCMS-UF6", 31, 0, 0.0, 8306.774193548388, 4935, 19045, 7494.0, 12377.800000000001, 18441.399999999998, 19045.0, 0.01603726439447946, 0.03509970328474214, 0.041875023118233955], "isController": true}, {"data": ["MA_ActivityLog_Home-/activityLogDetails?limit=25-UF1", 40, 0, 0.0, 7387.999999999998, 5233, 18688, 6050.0, 11985.599999999999, 17487.299999999977, 18688.0, 0.020192892606624782, 0.048986991202209104, 0.05181675691417263], "isController": false}, {"data": ["MA_ActivityLog_ApplyFilter-/activityLogDetails?limit=25&fleetType=Long%20Regional-UF3", 45, 0, 0.0, 7293.533333333333, 5245, 16560, 6180.0, 12096.999999999998, 13937.999999999995, 16560.0, 0.02382064010824099, 0.056172874060805095, 0.061735158947191233], "isController": false}, {"data": ["MA_ActivityLog_ApplyFilter-UF3", 45, 0, 0.0, 7293.533333333333, 5245, 16560, 6180.0, 12096.999999999998, 13937.999999999995, 16560.0, 0.02382064010824099, 0.056172874060805095, 0.061735158947191233], "isController": true}, {"data": ["MA_ActivityLog_View WeighBridge-UF9", 30, 0, 0.0, 7957.333333333333, 5365, 17921, 6378.0, 13275.9, 15466.899999999998, 17921.0, 0.015749908256784403, 0.03333422965623725, 0.040894903388750264], "isController": true}, {"data": ["MA_ActivityLog_View WeighBridge/activityLogDetails?limit=25&machineDescription=Weighbridge-UF9", 30, 0, 0.0, 7957.333333333333, 5365, 17921, 6378.0, 13275.9, 15466.899999999998, 17921.0, 0.015749916525442414, 0.03333424715661507, 0.04089492485846075], "isController": false}, {"data": ["MA_ActivityLog_Export csv-UF10", 14, 0, 0.0, 8217.285714285714, 5315, 16333, 6904.5, 14280.0, 16333.0, 16333.0, 0.006778410375615928, 0.03173029879232936, 0.017393790631123267], "isController": true}, {"data": ["MA_AactivityLog_AAE_Exists-UF4", 31, 0, 0.0, 7648.967741935485, 5313, 20082, 6960.0, 10429.800000000001, 17189.399999999994, 20082.0, 0.015524178908650222, 0.009952512757369603, 0.04006582048415407], "isController": true}, {"data": ["MA_ActivityLog_View UFWL-UF8", 30, 0, 0.0, 7630.9000000000015, 4972, 17113, 6252.0, 13268.000000000007, 15308.999999999998, 17113.0, 0.015841441951412186, 0.015936841260038852, 0.04123983193946246], "isController": true}, {"data": ["MA_ActivityLog_AAE_Exists/activityLogDetails?limit=25&aaeExists=true-UF4", 31, 0, 0.0, 7648.967741935485, 5313, 20082, 6960.0, 10429.800000000001, 17189.399999999994, 20082.0, 0.015526433753465274, 0.009953958332811612, 0.040071639935740595], "isController": false}, {"data": ["MA_ActivityLog_Home-UF1", 40, 0, 0.0, 7387.999999999998, 5233, 18688, 6050.0, 11985.599999999999, 17487.299999999977, 18688.0, 0.02018980435070094, 0.04897949924111573, 0.05180883217502743], "isController": true}, {"data": ["MA_AactivityLog_Unit_Select-UF2", 40, 0, 0.0, 7077.724999999999, 5104, 16923, 5998.0, 11010.3, 12931.349999999991, 16923.0, 0.02085686248132007, 0.044103404055043344, 0.05399055490464764], "isController": true}, {"data": ["MA_ActivityLog_View TCMS/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(TCMS)-UF6", 31, 0, 0.0, 8306.774193548388, 4935, 19045, 7494.0, 12377.800000000001, 18441.399999999998, 19045.0, 0.01603727269105953, 0.035099721442919986, 0.04187504478149733], "isController": false}, {"data": ["MA_ActivityLog_View TCMS-Upload/activityLogDetails?limit=25&machineDescription=Wheelset%20Condition(Upload)-UF7", 31, 0, 0.0, 6870.67741935484, 4631, 15336, 5356.0, 9826.800000000001, 14916.599999999999, 15336.0, 0.016238043431004292, 0.011023495335752977, 0.04243099371718671], "isController": false}, {"data": ["MA_ActivityLog_View UFWL/activityLogDetails?limit=25&machineDescription=WheelMachine(UFWL)-UF8", 30, 0, 0.0, 7630.9000000000015, 4972, 17113, 6252.0, 13268.000000000007, 15308.999999999998, 17113.0, 0.015841483776736463, 0.0159368833372409, 0.04123994082281723], "isController": false}, {"data": ["MA_ActivityLog_Export csv/activityLogDetails?limit=-1-UF10", 14, 0, 0.0, 8217.285714285714, 5315, 16333, 6904.5, 14280.0, 16333.0, 16333.0, 0.0067792604988954645, 0.03173427828961195, 0.017395972096321672], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 324, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
