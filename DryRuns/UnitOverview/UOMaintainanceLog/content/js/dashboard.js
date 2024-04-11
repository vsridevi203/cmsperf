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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9530472636815921, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R15"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R15"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&search=Failure"], "isController": false}, {"data": [0.49193548387096775, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit"], "isController": true}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [0.9875, 2000, 4000, "UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls"], "isController": true}, {"data": [0.4936708860759494, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab"], "isController": true}, {"data": [0.9936708860759493, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R15"], "isController": false}, {"data": [0.9919354838709677, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [0.9629629629629629, 2000, 4000, "UnitOverview_MaintainanceLog_UF4_SearchWithText"], "isController": true}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1260, 0, 0.0, 553.8000000000002, 26, 3744, 712.0, 920.9000000000001, 989.8500000000001, 1155.3400000000006, 0.5883058798371233, 10.59902960389622, 1.5467049647179891], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R15", 62, 0, 0.0, 78.99999999999999, 56, 252, 70.5, 91.50000000000001, 191.7999999999995, 252.0, 0.02988497658126472, 0.02660171499396757, 0.07708203841810142], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R15", 62, 0, 0.0, 44.77419354838709, 26, 167, 37.5, 69.7, 89.14999999999989, 167.0, 0.02988729597099968, 0.026360869967365, 0.07734928984530914], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 73, 0, 0.0, 667.958904109589, 601, 1060, 648.0, 758.6000000000001, 816.1999999999998, 1060.0, 0.03506948080834673, 0.1832243382076709, 0.09299661417373901], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=0&unitNumber=R01", 79, 0, 0.0, 45.594936708860764, 26, 287, 35.0, 52.0, 122.0, 287.0, 0.03815287906937884, 0.03389973103427625, 0.09874491063533236], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/units?unitnumber=R01", 79, 0, 0.0, 83.89873417721518, 62, 238, 74.0, 116.0, 125.0, 238.0, 0.038152547406954875, 0.034770998691222736, 0.09840495412639116], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality", 79, 0, 0.0, 58.63291139240505, 40, 287, 48.0, 89.0, 122.0, 287.0, 0.038152860643537345, 0.02698469732224872, 0.09986026439328742], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 62, 0, 0.0, 708.5645161290323, 634, 887, 689.0, 787.8, 821.0, 887.0, 0.029874133529667425, 0.26877073948478686, 0.07868687161928405], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&search=Failure", 54, 0, 0.0, 839.9629629629628, 749, 1182, 822.0, 958.0, 1063.25, 1182.0, 0.02635453783657551, 0.04422830588394339, 0.06980835507786057], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit", 62, 0, 0.0, 2440.0645161290336, 2208, 5647, 2377.5, 2566.6, 2679.8999999999996, 5647.0, 0.029800299541075388, 0.5448078482994122, 0.466386328559838], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 79, 0, 0.0, 977.9240506329112, 844, 1328, 944.0, 1133.0, 1194.0, 1328.0, 0.03813300793166565, 4.301274229996824, 0.10044231272348839], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls", 80, 0, 0.0, 1616.3125, 1466, 2186, 1587.5, 1766.9, 1857.05, 2186.0, 0.038421878954752, 2.6620818333791996, 0.20360969350386884], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls", 73, 0, 0.0, 1417.9178082191781, 1268, 1932, 1377.0, 1606.8000000000002, 1658.5, 1932.0, 0.03505787671249323, 1.916549943397137, 0.18593262326325438], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab", 79, 0, 0.0, 2742.405063291139, 2408, 5832, 2686.0, 3046.0, 3154.0, 5832.0, 0.03803788091446918, 4.662984525564104, 0.5953119267233928], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 79, 0, 0.0, 794.594936708861, 667, 3744, 738.0, 835.0, 949.0, 3744.0, 0.03808089635681511, 0.19854685302967273, 0.1003022264429888], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality", 62, 0, 0.0, 55.3548387096774, 34, 139, 47.0, 92.80000000000001, 122.24999999999986, 139.0, 0.029887368007500765, 0.020658193206167404, 0.07822602427505056], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R01", 79, 0, 0.0, 781.7594936708863, 668, 1304, 760.0, 846.0, 929.0, 1304.0, 0.03813965389471041, 0.07896100220389266, 0.099079839360847], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 80, 0, 0.0, 853.4999999999999, 755, 1220, 831.5, 949.4000000000001, 1011.4500000000002, 1220.0, 0.03843585296364448, 2.4428715230567075, 0.10184046553625223], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/unitConstraints?limit=10&unitNumber=R15", 62, 0, 0.0, 770.8225806451613, 678, 995, 759.5, 857.7, 897.6999999999998, 995.0, 0.029876480030223432, 0.038971470099907916, 0.07761400150996695], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 62, 0, 0.0, 781.548387096774, 658, 3713, 730.0, 808.4, 854.4, 3713.0, 0.02983128483824948, 0.16459174593608888, 0.07857354058257612], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=20&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 80, 0, 0.0, 762.8125, 674, 1159, 732.0, 903.4000000000001, 957.1500000000001, 1159.0, 0.038438438438438444, 0.22019331831831832, 0.10185013138138138], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF4_SearchWithText", 54, 0, 0.0, 1797.055555555555, 1602, 2187, 1763.5, 1968.0, 2098.25, 2187.0, 0.026343429534009123, 1.1458653415657363, 0.1438269501028613], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate", 54, 0, 0.0, 957.0925925925925, 843, 1245, 937.5, 1081.0, 1106.0, 1245.0, 0.02635404908002407, 1.1020997763993146, 0.0740778690774765], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 73, 0, 0.0, 749.958904109589, 656, 1014, 719.0, 875.6, 921.0, 1014.0, 0.03506890800224441, 1.7339316582945654, 0.09299603349032674], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1260, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
