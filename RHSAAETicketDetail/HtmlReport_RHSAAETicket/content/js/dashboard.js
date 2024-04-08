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

    var data = {"OkPercent": 99.10358565737052, "KoPercent": 0.896414342629482};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8484182776801406, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/cms/serviceNotification-Open-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS_Delete Tickett/serviceNotification?limit=0&isSnOnly=true&isExternal=true-UF6"], "isController": false}, {"data": [0.875, 2000, 4000, "RHS-TS- Edit Ticket -Save as draft -UF3"], "isController": true}, {"data": [0.4444444444444444, 2000, 4000, "RHS-TS_Delete Ticket-UF6"], "isController": true}, {"data": [1.0, 2000, 4000, "RHS-TS_Delete Ticket/serviceNotification?limit=0&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF6"], "isController": false}, {"data": [0.0, 2000, 4000, "RHS-TS_Edit_Ticket Submit/serviceNotification-POST-UF5"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/aaeDetailBehaviourLocation-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&isSnOnly=true-UF5"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS- Edit Ticket -Save as draf/cms/serviceNotification-POST-UF3"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/aaeDetailMaintenancePlan-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS- Edit Ticket -Save as draf/serviceNotificationDetail?state=UnSubmitted&type=Ticket&id=b57159d2-47e0-40cb-be20-f87e5db34f66-UF3"], "isController": false}, {"data": [0.9444444444444444, 2000, 4000, "RHS-TS_Delete Ticket/cms/serviceNotification-POST-UF6"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/serviceNotification-Open-UF1"], "isController": false}, {"data": [0.9883720930232558, 2000, 4000, "RHS-Create Ticket -Submit/cms/aaeDetailBehaviourLocation -UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/serviceNotification-unSubmitted-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/serviceNotification -Closed-UF1"], "isController": false}, {"data": [0.0, 2000, 4000, "RHS-TS_Edit_Ticket Submit-UF5"], "isController": true}, {"data": [0.07758620689655173, 2000, 4000, "RHS-AAE - Create Ticket -Save AsDraft-UF1"], "isController": true}, {"data": [1.0, 2000, 4000, "RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&isSnOnly=true&isExternal=true-UF5"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/s/alarms?limit=15&filter=typeId=4399&isIsolated=false&isActive=true&search=R39-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF5"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/cms/serviceNotification-Closed-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/alarmDetail-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS- Edit Ticket -Save as draf/serviceNotificationDetail?state=UnSubmitted&type=Ticket&id=8f29f66b-b55f-4acf-86ff-3c2d34f339e9-UF3"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket/cms/aaeDetailBehaviourFleet-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS- Edit Ticket -Save as draf/serviceNotification?limit=0&isSnOnly=true-UF3"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS_Delete Ticket /serviceNotification?limit=0&isSnOnly=true-UF6"], "isController": false}, {"data": [0.9827586206896551, 2000, 4000, "RHS-Create Ticket/cms/serviceNotification-POST"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/s/alarmDetail-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/cms/aaeDetailBehaviourFleet-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-TS_Delete Ticket/serviceNotification?limit=10&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF6"], "isController": false}, {"data": [0.0, 2000, 4000, "RHS-AAE - Create Ticket -Submit-UF2"], "isController": true}, {"data": [0.9883720930232558, 2000, 4000, "RHS-Create Ticket -Submit/cms/serviceNotification-unSubmitted-UF2"], "isController": false}, {"data": [0.0, 2000, 4000, "RHS-Create Ticket -Submit/cms/serviceNotification-POST-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "RHS-Create Ticket -Submit/cms/aaeDetailMaintenancePlan-UF2"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1004, 9, 0.896414342629482, 1058.724103585658, 40, 16370, 592.0, 1277.0, 2056.25, 11614.0, 0.4820704831220114, 1.972266287644351, 1.3174042096480838], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["RHS-Create Ticket -Submit/cms/serviceNotification-Open-UF2", 43, 0, 0.0, 468.953488372093, 332, 632, 476.0, 556.6, 598.9999999999999, 632.0, 0.02094375481584595, 0.01576965041707296, 0.05527844189301346], "isController": false}, {"data": ["RHS-TS_Delete Tickett/serviceNotification?limit=0&isSnOnly=true&isExternal=true-UF6", 9, 0, 0.0, 209.55555555555554, 177, 268, 195.0, 268.0, 268.0, 268.0, 0.004631490326103234, 0.0031117825628506103, 0.011992323529926375], "isController": false}, {"data": ["RHS-TS- Edit Ticket -Save as draft -UF3", 12, 0, 0.0, 1957.1666666666667, 1335, 3573, 1738.0, 3332.400000000001, 3573.0, 3573.0, 0.006681994419420994, 0.024189602844525024, 0.07682499101410958], "isController": true}, {"data": ["RHS-TS_Delete Ticket-UF6", 9, 0, 0.0, 3100.4444444444443, 2186, 4964, 3073.0, 4964.0, 4964.0, 4964.0, 0.004619703445836801, 0.02589760837952609, 0.0607333604377323], "isController": true}, {"data": ["RHS-TS_Delete Ticket/serviceNotification?limit=0&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF6", 9, 0, 0.0, 861.8888888888889, 625, 1089, 875.0, 1089.0, 1089.0, 1089.0, 0.004629574855853043, 0.003260695571760211, 0.01210390691751075], "isController": false}, {"data": ["RHS-TS_Edit_Ticket Submit/serviceNotification-POST-UF5", 12, 3, 25.0, 5061.583333333334, 640, 9376, 6071.0, 8505.100000000002, 9376.0, 9376.0, 0.006304156645684332, 0.0037887529971011385, 0.023294802787592998], "isController": false}, {"data": ["RHS-Create Ticket/cms/aaeDetailBehaviourLocation-UF1", 58, 0, 0.0, 1232.0689655172418, 732, 1792, 1250.5, 1530.9, 1650.35, 1792.0, 0.027926182433083088, 0.904730351493136, 0.07231739601950789], "isController": false}, {"data": ["RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&isSnOnly=true-UF5", 12, 0, 0.0, 957.0, 545, 1421, 845.0, 1373.6000000000001, 1421.0, 1421.0, 0.006332560760920501, 0.004270664959777685, 0.01629933526581979], "isController": false}, {"data": ["RHS-TS- Edit Ticket -Save as draf/cms/serviceNotification-POST-UF3", 12, 0, 0.0, 155.83333333333331, 74, 383, 119.0, 351.2000000000001, 383.0, 383.0, 0.0066932574912890045, 0.0034697306493742643, 0.024260334912477293], "isController": false}, {"data": ["RHS-Create Ticket/cms/aaeDetailMaintenancePlan-UF1", 58, 0, 0.0, 55.982758620689665, 40, 122, 47.0, 95.1, 118.14999999999999, 122.0, 0.027942946284985292, 0.02431881314864973, 0.07230999534244081], "isController": false}, {"data": ["RHS-TS- Edit Ticket -Save as draf/serviceNotificationDetail?state=UnSubmitted&type=Ticket&id=b57159d2-47e0-40cb-be20-f87e5db34f66-UF3", 24, 0, 0.0, 324.8333333333333, 143, 1925, 183.0, 991.5, 1853.75, 1925.0, 0.0126385767277461, 0.017835224588824968, 0.03319529171546561], "isController": false}, {"data": ["RHS-TS_Delete Ticket/cms/serviceNotification-POST-UF6", 9, 0, 0.0, 355.77777777777777, 90, 2018, 125.0, 2018.0, 2018.0, 2018.0, 0.004627787084771804, 0.0023952413622354064, 0.012744993923458459], "isController": false}, {"data": ["RHS-Create Ticket/cms/serviceNotification-Open-UF1", 58, 0, 0.0, 454.2586206896552, 330, 620, 468.5, 541.8, 562.2, 620.0, 0.02793792578241847, 0.021036704925167304, 0.07374206854931357], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/aaeDetailBehaviourLocation -UF2", 43, 0, 0.0, 1082.302325581395, 750, 2069, 1029.0, 1376.2, 1520.5999999999997, 2069.0, 0.02093807442755061, 0.579006327833031, 0.05422063495928031], "isController": false}, {"data": ["RHS-Create Ticket/cms/serviceNotification-unSubmitted-UF1", 58, 0, 0.0, 826.3620689655172, 586, 1336, 856.5, 1043.7, 1169.2499999999998, 1336.0, 0.027933714259294223, 0.019666760872716658, 0.07305226909654662], "isController": false}, {"data": ["RHS-Create Ticket/cms/serviceNotification -Closed-UF1", 58, 0, 0.0, 503.6379310344828, 337, 824, 561.0, 634.0, 691.2499999999997, 824.0, 0.027938504461490144, 0.021219188766987095, 0.07483776625274328], "isController": false}, {"data": ["RHS-TS_Edit_Ticket Submit-UF5", 12, 3, 25.0, 7577.916666666667, 2175, 13960, 8523.0, 12499.600000000006, 13960.0, 13960.0, 0.006290788555587766, 0.02641895698332574, 0.08870124491429063], "isController": true}, {"data": ["RHS-AAE - Create Ticket -Save AsDraft-UF1", 58, 0, 0.0, 4645.275862068965, 3468, 6832, 4647.5, 5605.1, 6078.8499999999985, 6832.0, 0.02784972289525719, 1.0388239242084196, 0.6083963095695969], "isController": true}, {"data": ["RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&isSnOnly=true&isExternal=true-UF5", 12, 0, 0.0, 221.5, 165, 603, 183.0, 491.1000000000004, 603.0, 603.0, 0.006337222627687114, 0.00425782145297728, 0.016411384965678656], "isController": false}, {"data": ["RHS-Create Ticket -Submit/s/alarms?limit=15&filter=typeId=4399&isIsolated=false&isActive=true&search=R39-UF2", 43, 0, 0.0, 732.0232558139536, 603, 1103, 712.0, 867.4000000000001, 1012.5999999999997, 1103.0, 0.020938971662754, 0.20409267798856343, 0.054613852188877314], "isController": false}, {"data": ["RHS-TS_Edit_Ticket Submit/serviceNotification?limit=0&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF5", 12, 0, 0.0, 1005.25, 607, 1669, 954.5, 1558.9000000000003, 1669.0, 1669.0, 0.006332199869556682, 0.004457996506472563, 0.016559156136745967], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/serviceNotification-Closed-UF2", 43, 0, 0.0, 552.5116279069767, 344, 1048, 572.0, 677.8000000000001, 962.5999999999992, 1048.0, 0.020944968799302875, 0.015912791634335916, 0.056100760247569534], "isController": false}, {"data": ["RHS-Create Ticket/cms/alarmDetail-UF1", 58, 0, 0.0, 154.8448275862069, 101, 567, 123.0, 233.90000000000012, 362.3499999999997, 567.0, 0.02793528838609651, 0.021109035012790028, 0.07152303041767591], "isController": false}, {"data": ["RHS-TS- Edit Ticket -Save as draf/serviceNotificationDetail?state=UnSubmitted&type=Ticket&id=8f29f66b-b55f-4acf-86ff-3c2d34f339e9-UF3", 12, 0, 0.0, 743.0000000000001, 486, 1003, 695.5, 980.2, 1003.0, 1003.0, 0.006692391475900977, 0.007717926400145895, 0.017884501243948265], "isController": false}, {"data": ["RHS-Create Ticket/cms/aaeDetailBehaviourFleet-UF1", 58, 0, 0.0, 1116.4310344827588, 696, 1689, 1110.0, 1363.5, 1517.8499999999995, 1689.0, 0.027923789238941937, 0.01510062403650891, 0.07222939064875629], "isController": false}, {"data": ["RHS-TS- Edit Ticket -Save as draf/serviceNotification?limit=0&isSnOnly=true-UF3", 12, 0, 0.0, 741.25, 568, 1042, 683.0, 1006.3000000000002, 1042.0, 1042.0, 0.006691514490474629, 0.004513287117273252, 0.017222154726216684], "isController": false}, {"data": ["RHS-TS_Delete Ticket /serviceNotification?limit=0&isSnOnly=true-UF6", 9, 0, 0.0, 760.8888888888888, 569, 1040, 725.0, 1040.0, 1040.0, 1040.0, 0.004630441862487196, 0.0031231365687088113, 0.011916253217513977], "isController": false}, {"data": ["RHS-Create Ticket/cms/serviceNotification-POST", 58, 0, 0.0, 301.6896551724138, 148, 3271, 188.0, 310.6, 530.9499999999941, 3271.0, 0.02790311461300545, 0.014526138212545722, 0.10011614220437491], "isController": false}, {"data": ["RHS-Create Ticket -Submit/s/alarmDetail-UF2", 43, 0, 0.0, 159.9767441860465, 106, 547, 145.0, 196.20000000000002, 254.5999999999999, 547.0, 0.02094604007805566, 0.01590409152274789, 0.05364853987833761], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/aaeDetailBehaviourFleet-UF2", 43, 0, 0.0, 957.2325581395348, 692, 1564, 912.0, 1157.4, 1407.6, 1564.0, 0.020940072920151605, 0.011292763707347386, 0.05416636458785311], "isController": false}, {"data": ["RHS-TS_Delete Ticket/serviceNotification?limit=10&state=unsubmitted&isSnOnly=true&sort=-snCreatedDateTime-UF6", 9, 0, 0.0, 912.3333333333333, 712, 1089, 997.0, 1089.0, 1089.0, 1089.0, 0.004629574855853043, 0.014063036902083978, 0.012107925645684234], "isController": false}, {"data": ["RHS-AAE - Create Ticket -Submit-UF2", 43, 6, 13.953488372093023, 15144.372093023254, 4993, 21108, 16357.0, 17607.4, 19551.8, 21108.0, 0.020737552766220742, 0.8680134303083192, 0.5069590351648612], "isController": true}, {"data": ["RHS-Create Ticket -Submit/cms/serviceNotification-unSubmitted-UF2", 43, 0, 0.0, 956.6976744186046, 602, 3348, 911.0, 1103.2, 1425.1999999999998, 3348.0, 0.02093978739785158, 0.014739456999659607, 0.054758171782467745], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/serviceNotification-POST-UF2", 43, 6, 13.953488372093023, 10163.186046511632, 676, 16370, 11373.0, 11816.4, 14205.999999999993, 16370.0, 0.02077998394625426, 0.011866186326867215, 0.07439490982211851], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/aaeDetailMaintenancePlan-UF2", 43, 0, 0.0, 71.48837209302326, 41, 387, 51.0, 106.0, 200.39999999999975, 387.0, 0.020946315567447867, 0.007762105539472357, 0.05420058949873518], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 9, 100.0, 0.896414342629482], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1004, 9, "400/Bad Request", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RHS-TS_Edit_Ticket Submit/serviceNotification-POST-UF5", 12, 3, "400/Bad Request", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["RHS-Create Ticket -Submit/cms/serviceNotification-POST-UF2", 43, 6, "400/Bad Request", 6, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
