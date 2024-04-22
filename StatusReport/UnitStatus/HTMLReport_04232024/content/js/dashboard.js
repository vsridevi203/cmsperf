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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9862068965517241, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9827586206896551, 2000, 4000, "SR_US_UF4_InService_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=true&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9444444444444444, 2000, 4000, "SR_US_UF8_ExportCSV"], "isController": true}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF3_ApplyFilter-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&fleet=&mode=Operational&InService=false&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9814814814814815, 2000, 4000, "SR_US_UF6_POS_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=false&IsPOS=true"], "isController": false}, {"data": [0.9827586206896551, 2000, 4000, "SR_US_UF5_MOS_ToggleON"], "isController": true}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF2_ViewSelectedUnit-/cms/unitStatusReport?limit=20&unit=R01,R02,R03&availability=&MOSConstraints=&fleet=&mode=&InService=false&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF1_Home-cms/unitStatusReport?limit=20&availability=&MOSConstraints=&fleet=&mode=&InService=false&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9814814814814815, 2000, 4000, "SR_US_UF6_POS_ToggleON"], "isController": true}, {"data": [0.9827586206896551, 2000, 4000, "SR_US_UF4_InService_ToggleON"], "isController": true}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF2_ViewSelectedUnit"], "isController": true}, {"data": [0.9444444444444444, 2000, 4000, "SR_US_UF8_ExportCSV-/cms/unitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9285714285714286, 2000, 4000, "SR_US_UF7_ExportPDF-/cms/unitStatusReport?limit=-1&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=false&IsPOS=false"], "isController": false}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF1_Home"], "isController": true}, {"data": [0.9285714285714286, 2000, 4000, "SR_US_UF7_ExportPDF"], "isController": true}, {"data": [0.9827586206896551, 2000, 4000, "SR_US_UF5_MOS_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=true&IsPOS=false"], "isController": false}, {"data": [0.9920634920634921, 2000, 4000, "SR_US_UF3_ApplyFilter"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 290, 0, 0.0, 918.4448275862075, 687, 2164, 820.5, 1206.8000000000002, 1467.8499999999983, 2153.18, 0.13596448045158963, 0.22163318321565376, 0.3620736495269374], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SR_US_UF4_InService_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=true&IsMOS=false&IsPOS=false", 29, 0, 0.0, 922.5862068965519, 730, 2164, 814.0, 1207.0, 1714.5, 2164.0, 0.013596479918233583, 0.021130951683267653, 0.036104661248391276], "isController": false}, {"data": ["SR_US_UF8_ExportCSV", 9, 0, 0.0, 1171.5555555555557, 786, 2129, 943.0, 2129.0, 2129.0, 2129.0, 0.004661449296380126, 0.01386700237733914, 0.012217589817064011], "isController": true}, {"data": ["SR_US_UF3_ApplyFilter-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&fleet=&mode=Operational&InService=false&IsMOS=false&IsPOS=false", 63, 0, 0.0, 911.047619047619, 723, 2143, 839.0, 1147.2, 1484.999999999999, 2143.0, 0.029948132686390287, 0.046639370142044466, 0.08009055046688188], "isController": false}, {"data": ["SR_US_UF6_POS_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=false&IsPOS=true", 27, 0, 0.0, 853.3703703703704, 687, 2126, 749.0, 1113.9999999999998, 1799.5999999999983, 2126.0, 0.012783291953343826, 0.01256135980137605, 0.033945447360771014], "isController": false}, {"data": ["SR_US_UF5_MOS_ToggleON", 29, 0, 0.0, 917.2413793103449, 706, 2155, 820.0, 1251.0, 1777.0, 2155.0, 0.01359563214532512, 0.017408415836942425, 0.036101494382659846], "isController": true}, {"data": ["SR_US_UF2_ViewSelectedUnit-/cms/unitStatusReport?limit=20&unit=R01,R02,R03&availability=&MOSConstraints=&fleet=&mode=&InService=false&IsMOS=false&IsPOS=false", 63, 0, 0.0, 909.7777777777777, 730, 2126, 802.0, 1303.2, 1533.1999999999994, 2126.0, 0.029949955051297616, 0.03032507229586372, 0.08009171000100308], "isController": false}, {"data": ["SR_US_UF1_Home-cms/unitStatusReport?limit=20&availability=&MOSConstraints=&fleet=&mode=&InService=false&IsMOS=false&IsPOS=false", 63, 0, 0.0, 914.6507936507941, 715, 2150, 838.0, 1171.0, 1308.1999999999996, 2150.0, 0.02995194851687935, 0.0734754094205534, 0.0795993274658417], "isController": false}, {"data": ["SR_US_UF6_POS_ToggleON", 27, 0, 0.0, 853.3703703703704, 687, 2126, 749.0, 1113.9999999999998, 1799.5999999999983, 2126.0, 0.012782178424061551, 0.012560265604199372, 0.03394249043466981], "isController": true}, {"data": ["SR_US_UF4_InService_ToggleON", 29, 0, 0.0, 922.5862068965519, 730, 2164, 814.0, 1207.0, 1714.5, 2164.0, 0.01359531346104802, 0.021129138835341062, 0.036101563789210755], "isController": true}, {"data": ["SR_US_UF2_ViewSelectedUnit", 63, 0, 0.0, 909.7777777777777, 730, 2126, 802.0, 1303.2, 1533.1999999999994, 2126.0, 0.02994717888067903, 0.030322261354258962, 0.08008428600815513], "isController": true}, {"data": ["SR_US_UF8_ExportCSV-/cms/unitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=false", 9, 0, 0.0, 1171.5555555555557, 786, 2129, 943.0, 2129.0, 2129.0, 2129.0, 0.004661806646907513, 0.013868065433118096, 0.01221852642752289], "isController": false}, {"data": ["SR_US_UF7_ExportPDF-/cms/unitStatusReport?limit=-1&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=false&IsPOS=false", 7, 0, 0.0, 1010.5714285714287, 766, 2153, 811.0, 2153.0, 2153.0, 2153.0, 0.003873633230018001, 0.011492823368135162, 0.010286636235127324], "isController": false}, {"data": ["SR_US_UF1_Home", 63, 0, 0.0, 914.6507936507941, 715, 2150, 838.0, 1171.0, 1308.1999999999996, 2150.0, 0.029948958418010447, 0.07346807438061513, 0.07959138107601378], "isController": true}, {"data": ["SR_US_UF7_ExportPDF", 7, 0, 0.0, 1010.5714285714287, 766, 2153, 811.0, 2153.0, 2153.0, 2153.0, 0.0038734660382798046, 0.011492327320884014, 0.010286192248696441], "isController": true}, {"data": ["SR_US_UF5_MOS_ToggleON-/cms/unitStatusReport?limit=20&unit=&availability=&MOSConstraints=&mode=&InService=false&IsMOS=true&IsPOS=false", 29, 0, 0.0, 917.2413793103449, 706, 2155, 820.0, 1251.0, 1777.0, 2155.0, 0.013596805032130658, 0.01740991765024704, 0.03610460883632917], "isController": false}, {"data": ["SR_US_UF3_ApplyFilter", 63, 0, 0.0, 911.047619047619, 723, 2143, 839.0, 1147.2, 1484.999999999999, 2143.0, 0.029945428022361154, 0.04663515806551584, 0.08008331736045786], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 290, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
