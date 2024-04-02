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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.008016032064128256, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "AAELog - Home/aaeLog?limit=20&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59"], "isController": false}, {"data": [0.0, 500, 1500, "AAELog - Home/aaeLog?limit=20&unitNumber=R01&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59"], "isController": false}, {"data": [0.0, 500, 1500, "AAELog - Home/aaeLogLocation?&unitNumber=R01"], "isController": false}, {"data": [0.0, 500, 1500, "AAEM-AAE Log-Apply Filter/aaeLog?limit=20&focus=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&location=SYP02"], "isController": false}, {"data": [0.0, 500, 1500, "AAEM-AAE Log-Apply Filter/aaeLogLocation?&location=SYP02&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&focus=true"], "isController": false}, {"data": [0.0, 500, 1500, "AAELog - Home/aaeLogLocation?"], "isController": false}, {"data": [0.02422145328719723, 500, 1500, "AAEM-AAE Log-Search AAE Code/aaeLogLocation?&search=AL70103&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&focus=true"], "isController": false}, {"data": [0.016835016835016835, 500, 1500, "AAEM-AAE Log-Search AAE Code"], "isController": true}, {"data": [0.0, 500, 1500, "AAEM-AAE Log-Apply Filter"], "isController": true}, {"data": [0.0, 500, 1500, "AAELog - Home"], "isController": true}, {"data": [0.0, 500, 1500, "AAEM-AAE Log-Search AAE Code/aaeLog?limit=20&unitNumber=R01&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1078, 0, 0.0, 6550.488868274585, 0, 56746, 6690.5, 9196.6, 9739.599999999999, 17337.600000000057, 1.4794503251908668, 40.37596194721327, 3.9159640392699364], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAELog - Home/aaeLog?limit=20&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59", 58, 0, 0.0, 8828.810344827587, 5213, 10802, 9064.5, 10005.7, 10386.65, 10802.0, 0.09203529712326224, 0.7871410524236226, 0.23976254843754216], "isController": false}, {"data": ["AAELog - Home/aaeLog?limit=20&unitNumber=R01&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59", 60, 0, 0.0, 5652.933333333333, 3569, 7758, 5706.5, 6668.6, 7006.949999999999, 7758.0, 0.09226241275435594, 0.767288702736657, 0.24168427341043397], "isController": false}, {"data": ["AAELog - Home/aaeLogLocation?&unitNumber=R01", 60, 0, 0.0, 6195.183333333334, 2530, 7769, 6259.0, 7393.099999999999, 7544.55, 7769.0, 0.0927156411286584, 1.6175393486146739, 0.23744952550839077], "isController": false}, {"data": ["AAEM-AAE Log-Apply Filter/aaeLog?limit=20&focus=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&location=SYP02", 164, 0, 0.0, 7565.249999999999, 2458, 10372, 7855.5, 9232.5, 9618.5, 10142.549999999997, 0.24829148208819193, 2.5233854926807, 0.653106129752738], "isController": false}, {"data": ["AAEM-AAE Log-Apply Filter/aaeLogLocation?&location=SYP02&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&focus=true", 78, 0, 0.0, 6195.346153846155, 1822, 8140, 6482.0, 7571.000000000001, 7980.65, 8140.0, 0.12439556513862131, 0.3010976338727529, 0.3272392048970387], "isController": false}, {"data": ["AAELog - Home/aaeLogLocation?", 56, 0, 0.0, 9627.124999999998, 6856, 11656, 9680.5, 10718.1, 11341.45, 11656.0, 0.09198030307509864, 40.24879953385696, 0.23424469029328576], "isController": false}, {"data": ["AAEM-AAE Log-Search AAE Code/aaeLogLocation?&search=AL70103&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59&focus=true", 289, 0, 0.0, 4886.474048442909, 1332, 8825, 5434.0, 7544.0, 7959.5, 8588.400000000005, 0.40283742513008586, 0.1491174732824002, 1.0598467309882342], "isController": false}, {"data": ["AAEM-AAE Log-Search AAE Code", 297, 0, 0.0, 10893.454545454546, 0, 19073, 10575.0, 15819.6, 16354.699999999997, 17282.999999999993, 0.40968116597742754, 0.4369700741357383, 2.104903218428342], "isController": true}, {"data": ["AAEM-AAE Log-Apply Filter", 82, 0, 0.0, 21828.91463414634, 12471, 39917, 22964.5, 24822.600000000002, 25561.249999999996, 39917.0, 0.12297448279482008, 2.7827165316321865, 0.954664700043491], "isController": true}, {"data": ["AAELog - Home", 60, 0, 0.0, 30768.999999999996, 18570, 56746, 31027.0, 32539.8, 38149.09999999998, 56746.0, 0.09019247073254325, 39.90464136796047, 0.9087581375217213], "isController": true}, {"data": ["AAEM-AAE Log-Search AAE Code/aaeLog?limit=20&unitNumber=R01&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59", 293, 0, 0.0, 6124.061433447101, 2024, 10070, 6676.0, 8823.2, 9268.1, 9744.54, 0.4063433948395776, 0.2924764497652777, 1.0690580621199197], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1078, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
