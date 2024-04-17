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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9508706467661692, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/units?unitnumber=R15"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/alarms?limit=0&unitNumber=R15"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}, {"data": [0.9722222222222222, 2000, 4000, "UnitOverview_MaintainanceLog_UF4_SearchWithText-/limit=25&unit=R15&isSnOnly=false&sort=-snCreatedDateTime&search=Failure"], "isController": false}, {"data": [0.9931506849315068, 2000, 4000, "UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted"], "isController": false}, {"data": [0.98125, 2000, 4000, "UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls"], "isController": true}, {"data": [0.5, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit"], "isController": true}, {"data": [0.5, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab"], "isController": true}, {"data": [0.99375, 2000, 4000, "UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/unitConstraints?limit=10&unitNumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted"], "isController": false}, {"data": [0.9166666666666666, 2000, 4000, "UnitOverview_MaintainanceLog_UF4_SearchWithText"], "isController": true}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/unitConstraints?limit=10&unitNumber=R15"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/alarms?limit=0&unitNumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/units?unitnumber=R01"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime"], "isController": false}, {"data": [1.0, 2000, 4000, "UnitOverview_MaintainanceLog_UF4_SearchWithText-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1260, 0, 0.0, 572.49523809524, 21, 3420, 751.0, 941.0, 990.9000000000001, 1187.510000000001, 0.6122582855310247, 11.14584548131519, 1.6096721320437037], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/units?unitnumber=R15", 62, 0, 0.0, 72.17741935483872, 56, 127, 67.0, 93.50000000000001, 111.04999999999993, 127.0, 0.030584554701216037, 0.02723840555563503, 0.07888693540665372], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/alarms?limit=-1&unitNumber=R15&fields=CarNumber,Criticality", 62, 0, 0.0, 38.72580645161289, 22, 180, 32.0, 62.500000000000014, 80.69999999999999, 180.0, 0.030585927710653178, 0.021125622417462395, 0.08005392527216543], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/alarms?limit=0&unitNumber=R15", 62, 0, 0.0, 34.77419354838708, 23, 112, 29.0, 54.7, 72.69999999999999, 112.0, 0.03058594279935375, 0.026478461884735394, 0.07915885574041415], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/alarms?limit=-1&unitNumber=R01&fields=CarNumber,Criticality", 79, 0, 0.0, 38.531645569620245, 22, 169, 33.0, 50.0, 72.0, 169.0, 0.038876403056767914, 0.027442138594622953, 0.10175356414188215], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 73, 0, 0.0, 724.3698630136987, 639, 1909, 691.0, 808.2000000000004, 862.1999999999998, 1909.0, 0.03616226254892432, 0.22586369059295708, 0.09588717655828391], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF4_SearchWithText-/limit=25&unit=R15&isSnOnly=false&sort=-snCreatedDateTime&search=Failure", 54, 0, 0.0, 962.611111111111, 807, 3420, 847.0, 1015.0, 2154.5, 3420.0, 0.026792000305627263, 0.044961003840434784, 0.0709642061046565], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls", 73, 0, 0.0, 1495.5068493150684, 1377, 2795, 1444.0, 1600.0000000000002, 1757.8999999999996, 2795.0, 0.03614505555445525, 2.0059930428504584, 0.19168406869541105], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF2_ViewUnsubmittedCalls-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=UnSubmitted", 73, 0, 0.0, 771.1369863013699, 713, 1179, 751.0, 835.6, 885.3, 1179.0, 0.03618339529120198, 1.7821251548946717, 0.09594417983271375], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls", 80, 0, 0.0, 1718.3625000000002, 1597, 3228, 1668.0, 1780.1000000000001, 1928.2000000000003, 3228.0, 0.03886953779746736, 2.7394668525136687, 0.20598055590848557], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit", 62, 0, 0.0, 2495.2258064516127, 2319, 3768, 2436.5, 2608.2000000000003, 2977.8999999999996, 3768.0, 0.030527916302301214, 0.5890275090685144, 0.47778054693470173], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab", 79, 0, 0.0, 2715.531645569621, 2503, 3993, 2682.0, 2825.0, 2895.0, 3993.0, 0.03879633153675216, 4.77011869099213, 0.6071921308516777], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 80, 0, 0.0, 835.0874999999999, 735, 2400, 787.0, 873.6, 911.8000000000001, 2400.0, 0.03889043640417081, 0.2694472994480961, 0.10304541436787727], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/unitConstraints?limit=10&unitNumber=R01", 79, 0, 0.0, 789.0126582278482, 723, 935, 783.0, 828.0, 856.0, 935.0, 0.03886179221731121, 0.08045557380788992, 0.10095966567175559], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/serviceNotification?limit=25&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 79, 0, 0.0, 806.5696202531645, 715, 1968, 772.0, 890.0, 949.0, 1968.0, 0.03883863628207076, 0.24095212256219958, 0.10230189745174299], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF3_ViewSubmittedCalls-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted", 80, 0, 0.0, 883.2749999999997, 828, 1060, 875.0, 951.7, 979.7, 1060.0, 0.03891135749566503, 2.472821993763239, 0.10310132259096139], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF4_SearchWithText", 54, 0, 0.0, 1953.185185185186, 1707, 4369, 1833.0, 2114.5, 3193.25, 4369.0, 0.02677611154333044, 1.1595238793639484, 0.14618248034682998], "isController": true}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/unitConstraints?limit=10&unitNumber=R15", 62, 0, 0.0, 795.2741935483873, 710, 959, 779.0, 856.0, 903.05, 959.0, 0.03057408767168953, 0.039883851136739645, 0.07942578565542707], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime", 79, 0, 0.0, 968.4177215189876, 906, 1196, 953.0, 1019.0, 1064.0, 1196.0, 0.0388575104927575, 4.359470579792176, 0.10235017155713849], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/alarms?limit=0&unitNumber=R01", 79, 0, 0.0, 33.50632911392404, 21, 133, 30.0, 43.0, 54.0, 133.0, 0.038876422188102826, 0.033810703657090276, 0.10061994283566592], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/serviceNotification?limit=20&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 62, 0, 0.0, 800.6774193548387, 714, 1958, 760.5, 850.4, 893.2499999999999, 1958.0, 0.030554259189809467, 0.21141383612666614, 0.08048117383303675], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF1_LoadMLTab-/cms/units?unitnumber=R01", 79, 0, 0.0, 79.49367088607596, 62, 156, 76.0, 96.0, 113.0, 156.0, 0.03887552303571578, 0.035447676098737925, 0.10027065006886873], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF5_LoadSelectedUnit-/cms/serviceNotification?limit=-1&unit=R15&isSnOnly=false&sort=-snCreatedDateTime", 62, 0, 0.0, 753.5967741935484, 697, 1299, 730.5, 795.2, 880.5999999999998, 1299.0, 0.03057267049811263, 0.2636565376204107, 0.08052918842503902], "isController": false}, {"data": ["UnitOverview_MaintainanceLog_UF4_SearchWithText-/cms/serviceNotification?limit=-1&unit=R01&isSnOnly=false&sort=-snCreatedDateTime&fields=NotificationDescription,ServiceOrderDescription,TicketId,Constraints,ServiceOrderNo,ServiceNotificationNo,SnCreatedDateTime,CarNumber,Effect,Priority,Status,SnCompleteByDate", 54, 0, 0.0, 990.574074074074, 891, 1193, 979.5, 1087.0, 1160.25, 1193.0, 0.026804661032724025, 1.1157779478922354, 0.07534060378739933], "isController": false}]}, function(index, item){
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
