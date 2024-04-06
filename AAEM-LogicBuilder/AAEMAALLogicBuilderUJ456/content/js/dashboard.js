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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.8970588235294118, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.40789473684210525, 500, 1500, "AAELogicBuilder_UF6_ActionEdit"], "isController": true}, {"data": [0.9811320754716981, 500, 1500, "AAELogicBuilder_UF5_ActionDisable"], "isController": true}, {"data": [0.99, 500, 1500, "AAEM-AAELogi-DisableCL/cms/customLogicRules/false/false/true"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.9905660377358491, 500, 1500, "AAEM_AAELogic_UF4_ApplyFilter"], "isController": true}, {"data": [1.0, 500, 1500, "AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM-AAELogi-DisableCL/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.99, 500, 1500, "AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35"], "isController": false}, {"data": [0.984375, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicRules/true/false/false"], "isController": false}, {"data": [0.5, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicRuleSetDetails"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 307, 0, 0.0, 209.12052117263852, 24, 1942, 82.0, 589.2, 730.5999999999985, 1682.8400000000008, 0.192523563755401, 0.5234032292770646, 0.5360949101582833], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAELogicBuilder_UF6_ActionEdit", 38, 0, 0.0, 1013.3421052631579, 660, 1942, 835.0, 1640.2, 1856.4999999999998, 1942.0, 0.02305662950908795, 0.1370907182807521, 0.1852351791378762], "isController": true}, {"data": ["AAELogicBuilder_UF5_ActionDisable", 53, 0, 0.0, 183.88679245283015, 78, 1185, 132.0, 255.8, 534.0999999999979, 1185.0, 0.031650464216761494, 0.18458649638915978, 0.16715693005575857], "isController": true}, {"data": ["AAEM-AAELogi-DisableCL/cms/customLogicRules/false/false/true", 50, 0, 0.0, 69.07999999999998, 24, 968, 43.0, 83.8, 150.39999999999952, 968.0, 0.03153927428129879, 0.016330198460883415, 0.08705886904104836], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicalarmdetails", 30, 0, 0.0, 93.46666666666667, 49, 315, 64.0, 194.60000000000005, 297.95, 315.0, 0.028217765905414048, 0.15283245378165092, 0.07289681380272019], "isController": false}, {"data": ["AAEM_AAELogic_UF4_ApplyFilter", 53, 0, 0.0, 196.28301886792448, 59, 1175, 154.0, 335.0, 408.89999999999975, 1175.0, 0.03166494899254679, 0.19948066029633613, 0.16162998405550327], "isController": true}, {"data": ["AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38", 48, 0, 0.0, 92.50000000000001, 49, 302, 69.0, 199.10000000000005, 277.4, 302.0, 0.031737530621758055, 0.1719445549885778, 0.0815288811528658], "isController": false}, {"data": ["AAEM-AAELogi-DisableCL/cms/customLogicalarmdetails", 48, 0, 0.0, 95.99999999999999, 54, 217, 79.5, 198.9, 214.64999999999998, 217.0, 0.03173811820729884, 0.17188833269581594, 0.08152974485693713], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35", 50, 0, 0.0, 108.61999999999998, 47, 1106, 68.5, 174.89999999999998, 239.7999999999998, 1106.0, 0.03153585279568489, 0.03102955453400416, 0.08146905690297743], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicRules/true/false/false", 32, 0, 0.0, 169.37499999999997, 89, 659, 116.0, 333.0, 546.5499999999996, 659.0, 0.023328631156115928, 0.012077948839218346, 0.08143734098257278], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicRuleSetDetails", 40, 0, 0.0, 626.6749999999998, 526, 1188, 583.0, 789.3, 891.5499999999997, 1188.0, 0.026404539996607017, 0.030854504342226603, 0.06843262568065953], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 307, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
