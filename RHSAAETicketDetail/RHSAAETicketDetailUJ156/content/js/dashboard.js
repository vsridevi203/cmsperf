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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6736111111111112, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "RHS-AAEs_Isolate Alarm-UF6"], "isController": true}, {"data": [0.4375, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourLocation-UF5"], "isController": false}, {"data": [0.5, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/aaeDetailBehaviourLocation-UF6"], "isController": false}, {"data": [0.6, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/aaeDetailBehaviourFleet-UF6"], "isController": false}, {"data": [0.875, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarms-UF5"], "isController": false}, {"data": [1.0, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/serviceNotification-Closed-UF6"], "isController": false}, {"data": [0.875, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=true&isIsolated=false&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha-UF5"], "isController": false}, {"data": [0.0, 500, 1500, "RHS-AAEs_View_AAE_Details-UF1"], "isController": true}, {"data": [1.0, 500, 1500, "RHS-AAEs_ML_Details/cms/aaeDetailMaintenancePlan-UF1"], "isController": false}, {"data": [0.8444444444444444, 500, 1500, "RHS-AAEs_ML_Details/cms/serviceNotification-Closed-UF1"], "isController": false}, {"data": [1.0, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/alarmDetail-UF6"], "isController": false}, {"data": [0.8111111111111111, 500, 1500, "RHS-AAEs_ML_Details/cms/serviceNotification-Open-UF1"], "isController": false}, {"data": [1.0, 500, 1500, "RHS-AAEs_Isolate Alarms/cms/aaeDetailMaintenancePlan-UF6"], "isController": false}, {"data": [0.9777777777777777, 500, 1500, "RHS-AAEs_View_AAE_Details/cms/alarmDetail"], "isController": false}, {"data": [0.5, 500, 1500, "RHS-AAEs_View History Details/cms/aaeDetailBehaviourFleet-UF1"], "isController": false}, {"data": [0.5, 500, 1500, "RHS-Ticket Details/cms/alarms-UF6"], "isController": false}, {"data": [0.5, 500, 1500, "RHS-AAEs_View History Details/cms/aaeDetailBehaviourLocation-UF1"], "isController": false}, {"data": [1.0, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailMaintenancePlan-UF5"], "isController": false}, {"data": [0.0, 500, 1500, "RHS-AAEs_Acknowldge Alarm-UF5"], "isController": true}, {"data": [1.0, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/alarmDetail-UF5"], "isController": false}, {"data": [1.0, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/serviceNotification-Open-UF6"], "isController": false}, {"data": [0.5, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourFleet-UF5"], "isController": false}, {"data": [0.8125, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/serviceNotification-Open-UF5"], "isController": false}, {"data": [0.8125, 500, 1500, "RHS-AAEs_Acknowldge Alarm/cms/serviceNotification-Closed-UF5"], "isController": false}, {"data": [0.8, 500, 1500, "RHS-AAEs_Isolate Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=false&isIsolated=true&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha-UF6"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 374, 0, 0.0, 535.9304812834228, 40, 2196, 472.5, 1067.0, 1170.5, 1976.25, 0.19561723251827898, 1.1428388842992065, 0.5110414388170492], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["RHS-AAEs_Isolate Alarm-UF6", 5, 0, 0.0, 4337.4, 2668, 6980, 4037.0, 6980.0, 6980.0, 6980.0, 0.002754813347621632, 0.1262527728918102, 0.057935016019239616], "isController": true}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourLocation-UF5", 8, 0, 0.0, 1131.125, 641, 1509, 1149.5, 1509.0, 1509.0, 1509.0, 0.004195981718107655, 0.11689896479230415, 0.01085720513656347], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/aaeDetailBehaviourLocation-UF6", 5, 0, 0.0, 1256.8, 488, 2160, 1236.0, 2160.0, 2160.0, 2160.0, 0.002762044863342306, 0.08874795401526749, 0.0071451726982361035], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/aaeDetailBehaviourFleet-UF6", 5, 0, 0.0, 900.4, 487, 1063, 975.0, 1063.0, 1063.0, 1063.0, 0.002764069528510548, 0.0014921656595318661, 0.007141772615755086], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarms-UF5", 8, 0, 0.0, 500.5, 455, 682, 472.5, 682.0, 682.0, 682.0, 0.004197091205939723, 0.041006175396703815, 0.01090157552245916], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/serviceNotification-Closed-UF6", 5, 0, 0.0, 346.6, 308, 383, 348.0, 383.0, 383.0, 383.0, 0.00276323853767206, 0.0020999533496253876, 0.00739220278329965], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=true&isIsolated=false&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha-UF5", 8, 0, 0.0, 484.99999999999994, 146, 1973, 298.5, 1973.0, 1973.0, 1973.0, 0.004193232542000465, 0.0021703254367775844, 0.011787324093894862], "isController": false}, {"data": ["RHS-AAEs_View_AAE_Details-UF1", 45, 0, 0.0, 3215.1555555555556, 2583, 5815, 3172.0, 3544.6, 3586.9, 5815.0, 0.023805379910057985, 0.8577815067178782, 0.37218326975092697], "isController": true}, {"data": ["RHS-AAEs_ML_Details/cms/aaeDetailMaintenancePlan-UF1", 45, 0, 0.0, 52.66666666666667, 40, 165, 46.0, 64.19999999999999, 110.79999999999977, 165.0, 0.023879063685993497, 0.02113618425695783, 0.06173629282046764], "isController": false}, {"data": ["RHS-AAEs_ML_Details/cms/serviceNotification-Closed-UF1", 45, 0, 0.0, 496.93333333333334, 438, 714, 481.0, 576.0, 674.6999999999995, 714.0, 0.023874654878600035, 0.018120490011374946, 0.0639626251894056], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/alarmDetail-UF6", 5, 0, 0.0, 179.6, 99, 435, 120.0, 435.0, 435.0, 435.0, 0.002763006438357603, 0.0019805143806196097, 0.007066712755916564], "isController": false}, {"data": ["RHS-AAEs_ML_Details/cms/serviceNotification-Open-UF1", 45, 0, 0.0, 521.4888888888889, 419, 815, 477.0, 660.4, 673.7, 815.0, 0.02387317297280952, 0.021558905098036513, 0.06302714535605776], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarms/cms/aaeDetailMaintenancePlan-UF6", 5, 0, 0.0, 51.8, 45, 69, 47.0, 69.0, 69.0, 69.0, 0.002763602034674362, 0.0018060571109414874, 0.007142723774383952], "isController": false}, {"data": ["RHS-AAEs_View_AAE_Details/cms/alarmDetail", 45, 0, 0.0, 181.02222222222224, 114, 2196, 136.0, 153.2, 166.0, 2196.0, 0.02385120663254354, 0.017168934982670775, 0.0610136433208406], "isController": false}, {"data": ["RHS-AAEs_View History Details/cms/aaeDetailBehaviourFleet-UF1", 45, 0, 0.0, 906.5999999999999, 660, 1236, 897.0, 1027.0, 1084.3, 1236.0, 0.02386393104702732, 0.012912831092156667, 0.06167438256055738], "isController": false}, {"data": ["RHS-Ticket Details/cms/alarms-UF6", 5, 0, 0.0, 610.4, 507, 814, 598.0, 814.0, 814.0, 814.0, 0.0027646411247002436, 0.02697576978667476, 0.0071783474827666095], "isController": false}, {"data": ["RHS-AAEs_View History Details/cms/aaeDetailBehaviourLocation-UF1", 45, 0, 0.0, 1056.4444444444443, 762, 1489, 1062.0, 1216.0, 1315.4999999999998, 1489.0, 0.023862842743336037, 0.7689795895471734, 0.06174148060056942], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailMaintenancePlan-UF5", 8, 0, 0.0, 67.49999999999999, 42, 154, 47.5, 154.0, 154.0, 154.0, 0.0041979347210656034, 0.0028973538712042143, 0.010852522158536054], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm-UF5", 8, 0, 0.0, 4258.625, 3205, 6006, 4082.5, 6006.0, 6006.0, 6006.0, 0.004184879611475777, 0.17490262962141487, 0.08806944278066418], "isController": true}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/alarmDetail-UF5", 8, 0, 0.0, 144.87499999999997, 110, 318, 118.5, 318.0, 318.0, 318.0, 0.004197329029671968, 0.003019392086408314, 0.010736697975680677], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/serviceNotification-Open-UF6", 5, 0, 0.0, 365.2, 322, 455, 356.0, 455.0, 455.0, 455.0, 0.002764853623119485, 0.002083360405858393, 0.007290141389084579], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/aaeDetailBehaviourFleet-UF5", 8, 0, 0.0, 820.0, 532, 997, 914.5, 997.0, 997.0, 997.0, 0.004197229933174854, 0.002258470403495453, 0.010848650708623576], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/serviceNotification-Open-UF5", 8, 0, 0.0, 553.25, 413, 841, 481.5, 841.0, 841.0, 841.0, 0.004198289406981126, 0.003941533670543437, 0.011088670397808913], "isController": false}, {"data": ["RHS-AAEs_Acknowldge Alarm/cms/serviceNotification-Closed-UF5", 8, 0, 0.0, 556.375, 431, 881, 495.5, 881.0, 881.0, 881.0, 0.004197293794825785, 0.0031899842732648126, 0.011246923350857035], "isController": false}, {"data": ["RHS-AAEs_Isolate Alarm/cms/alarm?alarmTxId=5655&isAcknowledged=false&isIsolated=true&unitNumber=R04&carNumber=RIB2444&LastModifiedBy=Ratnam%20Prasad%20Simha-UF6", 5, 0, 0.0, 626.6, 253, 1986, 296.0, 1986.0, 1986.0, 1986.0, 0.0027601602880282464, 0.0014285985865771197, 0.007753786215373099], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 374, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
