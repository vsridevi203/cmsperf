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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7700348432055749, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9833333333333333, 500, 1500, "AAELogicBuilder_UF5_ActionDisable"], "isController": true}, {"data": [0.9833333333333333, 500, 1500, "AAEM-AAELogi-DisableCL/cms/customLogicRules/false/false/true"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.9666666666666667, 500, 1500, "AAEM_AAELogic_UF4_ApplyFilter"], "isController": true}, {"data": [1.0, 500, 1500, "AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM-AAELogi-DisableCL/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.9833333333333333, 500, 1500, "AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35"], "isController": false}, {"data": [0.0, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicparameters"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicRules/true/false/false"], "isController": false}, {"data": [0.0, 500, 1500, "AAELogicBuilder_UF5_ActionEdit"], "isController": true}, {"data": [0.5, 500, 1500, "AAEM-AAELogi-EditCL/cms/customLogicRuleSetDetails"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 207, 0, 0.0, 22357.22222222222, 56, 453473, 153.0, 2348.0, 273264.19999999745, 453467.84, 0.12544070896422335, 24.20407086631202, 0.37422896288863894], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAELogicBuilder_UF5_ActionDisable", 30, 0, 0.0, 261.0333333333333, 179, 1219, 220.0, 305.5, 723.9999999999993, 1219.0, 0.023122723856870336, 0.13506244941904158, 0.12327302156194], "isController": true}, {"data": ["AAEM-AAELogi-DisableCL/cms/customLogicRules/false/false/true", 30, 0, 0.0, 118.53333333333333, 56, 1077, 79.5, 143.0, 571.5499999999993, 1077.0, 0.023125183556144475, 0.012078241216091736, 0.06387503907192471], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicalarmdetails", 20, 0, 0.0, 143.34999999999997, 117, 260, 131.0, 237.0000000000002, 259.3, 260.0, 0.0280415238885742, 0.1473823062190492, 0.072447905858996], "isController": false}, {"data": ["AAEM_AAELogic_UF4_ApplyFilter", 30, 0, 0.0, 334.1333333333334, 236, 1613, 283.5, 353.9, 958.4999999999992, 1613.0, 0.02311588222920322, 0.144769984691507, 0.11910322873974521], "isController": true}, {"data": ["AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38", 25, 0, 0.0, 149.39999999999998, 120, 215, 149.0, 173.0, 202.39999999999998, 215.0, 0.02367782997423852, 0.12692056798378543, 0.06082612540725868], "isController": false}, {"data": ["AAEM-AAELogi-DisableCL/cms/customLogicalarmdetails", 25, 0, 0.0, 143.28000000000003, 115, 215, 138.0, 187.20000000000005, 211.7, 215.0, 0.02367186627099931, 0.12689137471759462, 0.06081357925956296], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35", 30, 0, 0.0, 188.6333333333333, 109, 1440, 134.5, 212.5, 772.2999999999992, 1440.0, 0.0231224921730364, 0.021824110044179373, 0.0597353628362203], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicparameters", 20, 0, 0.0, 2414.6999999999994, 2232, 3341, 2349.5, 2724.0000000000005, 3311.1499999999996, 3341.0, 0.02795767766754687, 36.7834769382359, 0.07193095467081932], "isController": false}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicRules/true/false/false", 20, 0, 0.0, 186.2, 139, 293, 171.0, 248.30000000000004, 290.84999999999997, 293.0, 0.02804384374531142, 0.014644966252739533, 0.09720587791953941], "isController": false}, {"data": ["AAELogicBuilder_UF5_ActionEdit", 30, 0, 0.0, 153517.7, 3377, 453473, 3605.5, 453436.6, 453471.35, 453473.0, 0.016947745017786658, 22.382973459442915, 0.1754588125308237], "isController": true}, {"data": ["AAEM-AAELogi-EditCL/cms/customLogicRuleSetDetails", 27, 0, 0.0, 845.3703703703703, 759, 933, 861.0, 903.6, 925.4, 933.0, 0.021098266347640043, 0.025978308784458545, 0.05466715873163473], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 207, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
