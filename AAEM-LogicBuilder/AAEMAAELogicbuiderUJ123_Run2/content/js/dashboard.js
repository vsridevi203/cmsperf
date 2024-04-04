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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9689349112426036, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.98, 500, 1500, "AAEM-AAELogi-EnableCL/cms/customLogicalarmdetails-224"], "isController": false}, {"data": [0.9916666666666667, 500, 1500, "AAELogicBuilder_UF1_Home"], "isController": true}, {"data": [0.9833333333333333, 500, 1500, "AAEM-AAELogi-EnableCL/cms/customLogicRules/false/true/true-223"], "isController": false}, {"data": [0.89, 500, 1500, "AAELogicBuilder_UF2_searchByAAECode"], "isController": true}, {"data": [1.0, 500, 1500, "AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=20&search=CL05133"], "isController": false}, {"data": [0.975, 500, 1500, "AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=-1&fields=AAECode,TagName,CreatedDate,UpdatedDate,ShortDescription,Version,Type,%20Severity,%20Status,RuleParameters"], "isController": false}, {"data": [0.990909090909091, 500, 1500, "AAEM_AAELogic-Home/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.9333333333333333, 500, 1500, "AAELogicBuilder_UF3_ActionEnable"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 198, 0, 0.0, 186.70202020202015, 60, 1166, 143.0, 346.19999999999993, 435.15, 1017.4999999999986, 0.15054137873093618, 0.5789233433130356, 0.3943142854454618], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEM-AAELogi-EnableCL/cms/customLogicalarmdetails-224", 25, 0, 0.0, 207.80000000000004, 111, 751, 144.0, 392.4000000000003, 671.4999999999998, 751.0, 0.02366964746427067, 0.127985297302607, 0.06076072471726607], "isController": false}, {"data": ["AAELogicBuilder_UF1_Home", 60, 0, 0.0, 193.03333333333336, 118, 1166, 149.0, 332.5999999999999, 434.95, 1166.0, 0.04231884712175414, 0.22892953418234344, 0.10862870602895455], "isController": true}, {"data": ["AAEM-AAELogi-EnableCL/cms/customLogicRules/false/true/true-223", 30, 0, 0.0, 134.06666666666663, 60, 1016, 84.5, 272.8000000000002, 670.5999999999996, 1016.0, 0.023124933997584213, 0.012078110872110637, 0.06378100692321982], "isController": false}, {"data": ["AAELogicBuilder_UF2_searchByAAECode", 50, 0, 0.0, 379.4200000000001, 256, 1002, 290.5, 649.0999999999999, 737.55, 1002.0, 0.038175136838778, 0.2914246701000112, 0.20034938123829457], "isController": true}, {"data": ["AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=20&search=CL05133", 48, 0, 0.0, 160.10416666666669, 94, 370, 130.5, 310.1, 335.0999999999999, 370.0, 0.0373417642738894, 0.035572376070074935, 0.09617753072138065], "isController": false}, {"data": ["AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=-1&fields=AAECode,TagName,CreatedDate,UpdatedDate,ShortDescription,Version,Type,%20Severity,%20Status,RuleParameters", 40, 0, 0.0, 229.57500000000002, 130, 841, 165.0, 436.7, 540.9499999999996, 841.0, 0.03963790771304137, 0.264796900625288, 0.10592979228497675], "isController": false}, {"data": ["AAEM_AAELogic-Home/cms/customLogicalarmdetails", 55, 0, 0.0, 197.85454545454547, 118, 1166, 149.0, 345.0, 435.59999999999997, 1166.0, 0.042390059453985204, 0.22940082156752276, 0.10880968279518512], "isController": false}, {"data": ["AAELogicBuilder_UF3_ActionEnable", 30, 0, 0.0, 330.4, 198, 1337, 244.0, 559.7, 1051.5499999999997, 1337.0, 0.023122135745434532, 0.1369888695337344, 0.12313064156026629], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 198, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
