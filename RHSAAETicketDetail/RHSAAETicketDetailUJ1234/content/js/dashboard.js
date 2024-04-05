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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2387778743121923, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06966707768187423, 500, 1500, "RHS-AAEs_View History Details/cms/aaeDetailBehaviourFleet"], "isController": false}, {"data": [0.8514851485148515, 500, 1500, "RHS-AAEs_View_AAE_Details/cms/alarmDetail"], "isController": false}, {"data": [0.8538961038961039, 500, 1500, "RHS-AAEs_View_AAE_Details"], "isController": true}, {"data": [0.8809523809523809, 500, 1500, "RHS-AAEs_ML_Details/cms/aaeDetailMaintenancePlan"], "isController": false}, {"data": [0.0018427518427518428, 500, 1500, "RHS-AAEs_View History Details"], "isController": true}, {"data": [0.38571428571428573, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/serviceNotification"], "isController": false}, {"data": [0.9583333333333334, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailMaintenancePlan"], "isController": false}, {"data": [0.375, 500, 1500, "RHS-AAEs_ML_Details/cms/serviceNotification-Open"], "isController": false}, {"data": [0.7638888888888888, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarmDetail"], "isController": false}, {"data": [0.27941176470588236, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourFleet"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "RHS-AAEs_ML_Details/cms/serviceNotification-Closed"], "isController": false}, {"data": [0.2714285714285714, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourLocation"], "isController": false}, {"data": [0.9864864864864865, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=true&isIsolated=false&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha"], "isController": false}, {"data": [0.06142506142506143, 500, 1500, "RHS-AAEs_View History Details/cms/aaeDetailBehaviourLocation"], "isController": false}, {"data": [0.4852941176470588, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarms"], "isController": false}, {"data": [0.07142857142857142, 500, 1500, "RHS-AAEs_ML_Details"], "isController": true}, {"data": [0.0, 500, 1500, "RHS-AAEs_Acknowldge Alarm"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2272, 0, 0.0, 1636.9392605633807, 52, 4536, 1874.0, 2501.4, 2677.4499999999994, 3011.5099999999998, 1.5774546186718692, 18.06386804656338, 4.0902251687154365], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["RHS-AAEs_View History Details/cms/aaeDetailBehaviourFleet", 811, 0, 0.0, 1925.7533908754642, 583, 3405, 1972.0, 2419.0000000000005, 2586.6, 2827.8, 0.5648584232161687, 0.3046531540308325, 1.4618367092504447], "isController": false}, {"data": ["RHS-AAEs_View_AAE_Details/cms/alarmDetail", 303, 0, 0.0, 406.6666666666666, 105, 2446, 157.0, 1103.0, 1550.0000000000007, 2048.6799999999994, 0.213993780761606, 0.15564469400478412, 0.5483935480698537], "isController": false}, {"data": ["RHS-AAEs_View_AAE_Details", 308, 0, 0.0, 403.23701298701286, 105, 2446, 156.5, 1103.0, 1535.0000000000007, 2047.0300000000009, 0.21416551935138442, 0.15577507557504833, 0.548837848931606], "isController": true}, {"data": ["RHS-AAEs_ML_Details/cms/aaeDetailMaintenancePlan", 21, 0, 0.0, 309.85714285714283, 54, 1199, 74.0, 972.6000000000001, 1178.3999999999996, 1199.0, 0.015264523285303389, 0.0056532116556992276, 0.039516403774625855], "isController": false}, {"data": ["RHS-AAEs_View History Details", 814, 0, 0.0, 4023.676904176904, 1276, 7380, 4161.0, 4887.0, 5079.5, 5746.6, 0.5643473884027306, 16.758092230889837, 2.9226671456657565], "isController": true}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/serviceNotification", 70, 0, 0.0, 1187.3571428571422, 439, 3351, 850.5, 2366.4, 2748.3, 3351.0, 0.051809789977914224, 0.14948078495162445, 0.13806282663297056], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailMaintenancePlan", 36, 0, 0.0, 178.05555555555554, 52, 1083, 77.0, 484.70000000000033, 655.4499999999992, 1083.0, 0.026657701780290182, 0.009877320654757585, 0.06901252629671208], "isController": false}, {"data": ["RHS-AAEs_ML_Details/cms/serviceNotification-Open", 20, 0, 0.0, 1279.3999999999999, 440, 3383, 775.5, 2864.300000000001, 3359.1499999999996, 3383.0, 0.015284840647893826, 0.03792998883824512, 0.04040481948221074], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarmDetail", 36, 0, 0.0, 591.1388888888889, 110, 2033, 430.5, 1427.8000000000002, 1568.8999999999992, 2033.0, 0.02665357679894985, 0.019345244705748214, 0.06829762147367625], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourFleet", 34, 0, 0.0, 1545.5882352941176, 604, 2837, 1252.5, 2720.5, 2774.75, 2837.0, 0.027085288386624967, 0.014557097779484328, 0.07010387730882167], "isController": false}, {"data": ["RHS-AAEs_ML_Details/cms/serviceNotification-Closed", 21, 0, 0.0, 1152.5714285714287, 644, 2452, 877.0, 2324.6, 2441.6, 2452.0, 0.0152579908277678, 0.0532695740041618, 0.04092921981533472], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourLocation", 35, 0, 0.0, 1652.4857142857145, 620, 3027, 1445.0, 2859.6, 2932.5999999999995, 3027.0, 0.026433527984798456, 0.6702588316777134, 0.06848820894722055], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=true&isIsolated=false&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha", 37, 0, 0.0, 247.29729729729732, 142, 772, 220.0, 364.2000000000001, 475.9000000000005, 772.0, 0.026456653276263235, 0.013707350712971054, 0.07448056249347522], "isController": false}, {"data": ["RHS-AAEs_View History Details/cms/aaeDetailBehaviourLocation", 814, 0, 0.0, 2097.87592137592, 644, 4536, 2143.0, 2659.5, 2805.25, 3239.150000000001, 0.5651619980628969, 16.47746479453862, 1.4642616616734765], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarms", 34, 0, 0.0, 1170.794117647059, 1008, 2349, 1128.0, 1310.0, 1686.0, 2349.0, 0.02710480791460391, 0.2630970967462272, 0.07050317410255183], "isController": false}, {"data": ["RHS-AAEs_ML_Details", 21, 0, 0.0, 2703.5238095238096, 1212, 5868, 2587.0, 4521.8, 5745.0999999999985, 5868.0, 0.015250201338967677, 0.09547899725024346, 0.12070168423042038], "isController": true}, {"data": ["RHS-AAEs_Acknowldge Alarm", 38, 0, 0.0, 7818.157894736842, 5482, 10027, 7838.0, 9542.4, 9885.449999999999, 10027.0, 0.026318158837014414, 1.1315577341623555, 0.5546765701725225], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2272, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
