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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9680998613037448, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "SR-US-MOS Toggle ON/unitStatusReport?limit=20&unit=&InService=false&IsMOS=true&IsPOS=false-UF5"], "isController": false}, {"data": [0.9411764705882353, 2000, 4000, "SR-US-Export csv-UF8"], "isController": true}, {"data": [1.0, 2000, 4000, "SR-US-In Service Toggle ON-UF4"], "isController": true}, {"data": [1.0, 2000, 4000, "SR-US-Home/unitStatusReport?limit=20&InService=false&IsMOS=false&IsPOS=false-UF1"], "isController": false}, {"data": [0.9722222222222222, 2000, 4000, "SR-US-Export PDF-UF7"], "isController": true}, {"data": [0.9779411764705882, 2000, 4000, "SR-US-Apply Filter/unitStatusReport?limit=20&unit=&mode=Operational&InService=false&IsMOS=false&IsPOS=false-UF3"], "isController": false}, {"data": [0.9848484848484849, 2000, 4000, "SR-US-View Selected Unit/unitStatusReport?limit=20&unit=R01,R02,R03&InService=false&IsMOS=false&IsPOS=false-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "SR-US-POS Toggle ON/unitStatusReport?limit=20&unit=&InService=false&IsMOS=false&IsPOS=true-UF6"], "isController": false}, {"data": [0.9758064516129032, 2000, 4000, "SR-US-Home/unitwiseOpenSNOrdersReport?limit=10-UF1"], "isController": false}, {"data": [0.9848484848484849, 2000, 4000, "SR-US-View Selected Unit-UF2"], "isController": true}, {"data": [0.9722222222222222, 2000, 4000, "SR-US-Export PDF/unitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=false-UF7"], "isController": false}, {"data": [1.0, 2000, 4000, "SR-US-MOS Toggle ON-UF5"], "isController": true}, {"data": [1.0, 2000, 4000, "SR-US-POS Toggle ON-UF6"], "isController": true}, {"data": [0.9444444444444444, 2000, 4000, "SR-US-Export csv/consunitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=falsetraintStatusReport?limit=20&unit=R01&InService=true-UF8"], "isController": false}, {"data": [0.9779411764705882, 2000, 4000, "SR-US-Apply Filter-UF3"], "isController": true}, {"data": [1.0, 2000, 4000, "SR-US-In Service Toggle ON/unitStatusReport?limit=20&unit=&InService=true&IsMOS=false&IsPOS=false-UF4"], "isController": false}, {"data": [0.782258064516129, 2000, 4000, "SR-US-Home-UF1"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 392, 0, 0.0, 994.920918367347, 722, 4988, 855.5, 1285.1, 1456.3499999999992, 4217.36, 0.184899816845411, 0.2942718209200464, 0.48490691862568497], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["SR-US-MOS Toggle ON/unitStatusReport?limit=20&unit=&InService=false&IsMOS=true&IsPOS=false-UF5", 33, 0, 0.0, 910.8787878787878, 740, 1412, 850.0, 1212.4, 1343.3999999999996, 1412.0, 0.016532478053135385, 0.020817262700074297, 0.04337524974061544], "isController": false}, {"data": ["SR-US-Export csv-UF8", 17, 0, 0.0, 1159.8235294117646, 760, 4988, 886.0, 2142.3999999999974, 4988.0, 4988.0, 0.008762516223541067, 0.025711703165123948, 0.02299858491806016], "isController": true}, {"data": ["SR-US-In Service Toggle ON-UF4", 32, 0, 0.0, 899.53125, 747, 1676, 843.0, 1039.7, 1542.0999999999995, 1676.0, 0.016533913122553496, 0.025209070847042703, 0.043379825222329464], "isController": true}, {"data": ["SR-US-Home/unitStatusReport?limit=20&InService=false&IsMOS=false&IsPOS=false-UF1", 62, 0, 0.0, 880.241935483871, 736, 1944, 816.5, 1111.0, 1222.8999999999999, 1944.0, 0.029275815484923192, 0.07166137508269237, 0.07666687182363303], "isController": false}, {"data": ["SR-US-Export PDF-UF7", 18, 0, 0.0, 1071.3333333333337, 787, 2464, 899.5, 2045.5000000000007, 2464.0, 2464.0, 0.008739938752451432, 0.025626152882893074, 0.022936174988868716], "isController": true}, {"data": ["SR-US-Apply Filter/unitStatusReport?limit=20&unit=&mode=Operational&InService=false&IsMOS=false&IsPOS=false-UF3", 68, 0, 0.0, 1011.4705882352939, 738, 4986, 857.0, 1364.4, 1791.0499999999988, 4986.0, 0.03214860978537493, 0.049187391439345265, 0.08491181382220021], "isController": false}, {"data": ["SR-US-View Selected Unit/unitStatusReport?limit=20&unit=R01,R02,R03&InService=false&IsMOS=false&IsPOS=false-UF2", 66, 0, 0.0, 947.469696969697, 726, 4214, 817.5, 1351.1000000000001, 1549.0999999999997, 4214.0, 0.03255726996438925, 0.03258472859939118, 0.08579811804180847], "isController": false}, {"data": ["SR-US-POS Toggle ON/unitStatusReport?limit=20&unit=&InService=false&IsMOS=false&IsPOS=true-UF6", 33, 0, 0.0, 872.3939393939394, 722, 1714, 801.0, 1283.8000000000006, 1600.5999999999995, 1714.0, 0.0163772362371662, 0.010466949899801091, 0.04296698200290622], "isController": false}, {"data": ["SR-US-Home/unitwiseOpenSNOrdersReport?limit=10-UF1", 62, 0, 0.0, 1217.6451612903218, 1050, 4262, 1137.5, 1288.6, 1355.35, 4262.0, 0.02925451475017352, 0.04009685869031312, 0.07575264169447811], "isController": false}, {"data": ["SR-US-View Selected Unit-UF2", 66, 0, 0.0, 947.469696969697, 726, 4214, 817.5, 1351.1000000000001, 1549.0999999999997, 4214.0, 0.03255726996438925, 0.03258472859939118, 0.08579811804180847], "isController": true}, {"data": ["SR-US-Export PDF/unitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=false-UF7", 18, 0, 0.0, 1071.3333333333337, 787, 2464, 899.5, 2045.5000000000007, 2464.0, 2464.0, 0.008740507444727217, 0.025627820331100136, 0.022937667404996753], "isController": false}, {"data": ["SR-US-MOS Toggle ON-UF5", 33, 0, 0.0, 910.8787878787878, 740, 1412, 850.0, 1212.4, 1343.3999999999996, 1412.0, 0.016532585726466868, 0.020817398279508913, 0.043375532236538214], "isController": true}, {"data": ["SR-US-POS Toggle ON-UF6", 33, 0, 0.0, 872.3939393939394, 722, 1714, 801.0, 1283.8000000000006, 1600.5999999999995, 1714.0, 0.01637721998179647, 0.010466939510737999, 0.04296693935565069], "isController": true}, {"data": ["SR-US-Export csv/consunitStatusReport?limit=-1&unit=&InService=false&IsMOS=false&IsPOS=falsetraintStatusReport?limit=20&unit=R01&InService=true-UF8", 18, 0, 0.0, 1206.1111111111109, 760, 4988, 889.0, 2292.500000000004, 4988.0, 4988.0, 0.00872885979268958, 0.025617820664363217, 0.02290804767533491], "isController": false}, {"data": ["SR-US-Apply Filter-UF3", 68, 0, 0.0, 1011.4705882352939, 738, 4986, 857.0, 1364.4, 1791.0499999999988, 4986.0, 0.03214535752492092, 0.04918241547898237, 0.0849032238602698], "isController": true}, {"data": ["SR-US-In Service Toggle ON/unitStatusReport?limit=20&unit=&InService=true&IsMOS=false&IsPOS=false-UF4", 32, 0, 0.0, 899.53125, 747, 1676, 843.0, 1039.7, 1542.0999999999995, 1676.0, 0.016533913122553496, 0.025209070847042703, 0.043379825222329464], "isController": false}, {"data": ["SR-US-Home-UF1", 62, 0, 0.0, 2097.8870967741937, 1844, 5359, 1960.0, 2374.3000000000006, 3105.799999999996, 5359.0, 0.02924057969920876, 0.11165288389933506, 0.15229115490739462], "isController": true}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 392, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
