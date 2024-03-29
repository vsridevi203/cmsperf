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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5367847411444142, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R15"], "isController": false}, {"data": [0.49166666666666664, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R15"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R01"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R01"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality"], "isController": false}, {"data": [0.5, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [0.46875, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&search=Failure"], "isController": false}, {"data": [0.30833333333333335, 500, 1500, "UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit"], "isController": true}, {"data": [0.4935897435897436, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [0.0, 500, 1500, "UnitOverview_MaintainanceLog_UF1_LoadMLTab"], "isController": true}, {"data": [0.46794871794871795, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [0.990909090909091, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality"], "isController": false}, {"data": [0.5, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R01"], "isController": false}, {"data": [0.5, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [0.5, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R15"], "isController": false}, {"data": [0.4909090909090909, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [0.4859154929577465, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [0.0, 500, 1500, "UnitOverview_MaintainanceLog_UF4_SearchWithText"], "isController": true}, {"data": [0.4895833333333333, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate"], "isController": false}, {"data": [0.49166666666666664, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1156, 0, 0.0, 587.1496539792391, 41, 2143, 756.0, 962.3, 1031.1499999999999, 1543.2900000000002, 0.6425681380698831, 11.457434194783191, 1.6879654371922996], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R15", 55, 0, 0.0, 79.12727272727273, 58, 380, 70.0, 95.0, 114.59999999999982, 380.0, 0.030861565119024645, 0.02749978063739793, 0.07956880834940006], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 60, 0, 0.0, 758.6, 648, 1986, 706.5, 822.6999999999999, 1360.199999999998, 1986.0, 0.03348369372018905, 0.1776984639564779, 0.088743232980378], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R15", 55, 0, 0.0, 58.18181818181817, 41, 143, 52.0, 95.8, 101.99999999999997, 143.0, 0.0308636259822349, 0.026853875426268763, 0.07984045206373844], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R01", 78, 0, 0.0, 63.76923076923079, 42, 222, 54.0, 100.20000000000002, 109.14999999999999, 222.0, 0.04345909913744832, 0.039203076082396225, 0.11242767524881728], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R01", 78, 0, 0.0, 85.41025641025641, 65, 302, 78.0, 104.0, 121.99999999999994, 302.0, 0.043457452646698154, 0.03960748100547174, 0.11204092145956869], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality", 78, 0, 0.0, 82.07692307692308, 58, 292, 71.0, 111.20000000000002, 147.94999999999993, 292.0, 0.04345859064904848, 0.030109024824048425, 0.11370010480206284], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 55, 0, 0.0, 753.690909090909, 693, 1018, 728.0, 813.2, 967.7999999999998, 1018.0, 0.030848600118570803, 0.20772741833394, 0.08121967547553116], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&search=Failure", 48, 0, 0.0, 936.3125000000002, 803, 2143, 872.5, 982.3000000000002, 1655.3999999999999, 2143.0, 0.027232590148383574, 0.04533667778853213, 0.07209611054786298], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls", 60, 0, 0.0, 1553.883333333334, 1351, 2785, 1460.5, 1768.8999999999999, 2248.1, 2785.0, 0.03346460755218108, 1.807880759956139, 0.17739183227929115], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls", 71, 0, 0.0, 1729.845070422535, 1559, 3171, 1685.0, 1876.3999999999999, 1942.7999999999993, 3171.0, 0.039648679196393866, 2.7432382554399664, 0.21001627899379469], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit", 55, 0, 0.0, 2622.4727272727278, 2373, 3997, 2522.0, 3048.6, 3367.9999999999995, 3997.0, 0.03079057315812191, 0.5013664235307719, 0.4816844025033296], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 78, 0, 0.0, 999.8461538461537, 877, 1652, 969.0, 1125.3, 1208.2, 1652.0, 0.04343131921518492, 4.854535270268088, 0.11435032645178929], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab", 78, 0, 0.0, 2895.4230769230767, 2534, 4545, 2802.5, 3152.8000000000006, 3803.849999999999, 4545.0, 0.0433501917412327, 5.277829398932918, 0.6781662920997055], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 78, 0, 0.0, 842.2692307692306, 714, 2054, 777.0, 907.4000000000001, 1529.6499999999999, 2054.0, 0.04340422690394311, 0.23425794683399553, 0.11427682141247371], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality", 55, 0, 0.0, 78.76363636363635, 52, 515, 67.0, 98.0, 115.39999999999989, 515.0, 0.03086333155635364, 0.020936320705086837, 0.08074608158441121], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R01", 78, 0, 0.0, 822.0512820512823, 704, 1432, 800.0, 880.3000000000001, 925.2499999999997, 1432.0, 0.0434409945982794, 0.0899353463639609, 0.11280397992608347], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 71, 0, 0.0, 904.56338028169, 812, 1105, 886.0, 1031.4, 1092.0, 1105.0, 0.03970029076269291, 2.5201013300995303, 0.10514537697802505], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R15", 55, 0, 0.0, 836.3090909090911, 722, 1299, 811.0, 950.1999999999999, 1109.1999999999994, 1299.0, 0.030848703933770635, 0.04024025005678966, 0.08010639384960977], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 55, 0, 0.0, 816.4, 705, 2067, 766.0, 882.4, 1138.7999999999981, 2067.0, 0.0308252594506042, 0.1789528911571298, 0.08116041233828648], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 71, 0, 0.0, 825.2816901408451, 718, 2066, 790.0, 872.6, 956.3999999999999, 2066.0, 0.039672428667855725, 0.2265487534685437, 0.10507049347053289], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF4_SearchWithText", 48, 0, 0.0, 1929.458333333333, 1739, 3235, 1861.5, 2003.2000000000005, 2964.1499999999983, 3235.0, 0.02721389269221938, 1.1716125613375628, 0.14850207984300984], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate", 48, 0, 0.0, 993.1458333333336, 899, 1545, 976.0, 1077.7, 1141.4999999999998, 1545.0, 0.02725143708750266, 1.1278608686395573, 0.0765609475906607], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 60, 0, 0.0, 795.2833333333332, 691, 1512, 760.5, 891.6999999999999, 1017.3499999999997, 1512.0, 0.03350746043606609, 1.632371235541531, 0.0888127673267078], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1156, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
