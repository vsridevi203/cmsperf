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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.005810200129115558, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "AAELog-No Ticket-ON/aaeLogLocation?&noTicket=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59"], "isController": false}, {"data": [0.0, 500, 1500, "AAELog-No Ticket-ON"], "isController": true}, {"data": [0.01674641148325359, 500, 1500, "AAELog-Active-ON"], "isController": true}, {"data": [0.0, 500, 1500, "AAELog-Focus-ON/aaeLog?limit=20&focus=true&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59"], "isController": false}, {"data": [0.0, 500, 1500, "AAELog-Active-ON/aaeLog?limit=20&isActive=true&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59"], "isController": false}, {"data": [0.009852216748768473, 500, 1500, "AAELog-Focus-ON"], "isController": true}, {"data": [0.0, 500, 1500, "AAELog-No Ticket-ON/aaeLog?limit=20&noTicket=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 842, 0, 0.0, 9869.085510688834, 0, 31261, 10405.5, 13488.600000000002, 14081.65, 15888.369999999992, 1.1553016270269232, 120.75130982279087, 2.9993158190910165], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAELog-No Ticket-ON/aaeLogLocation?&noTicket=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59", 103, 0, 0.0, 10253.601941747573, 4016, 16920, 10638.0, 14507.0, 15800.4, 16902.079999999998, 0.16140178231443889, 128.18850237068662, 0.4226222545047551], "isController": false}, {"data": ["AAELog-No Ticket-ON", 106, 0, 0.0, 18530.27358490568, 9449, 31261, 18689.0, 25738.7, 27603.55, 31169.43999999999, 0.1604961450642893, 125.20050336975662, 0.8285873727386699], "isController": true}, {"data": ["AAELog-Active-ON", 418, 0, 0.0, 10179.65550239233, 0, 15205, 10979.0, 13413.6, 13912.35, 14965.56, 0.5686401745643713, 4.782246438176705, 1.4642200196201267], "isController": true}, {"data": ["AAELog-Focus-ON/aaeLog?limit=20&focus=true&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59", 202, 0, 0.0, 9735.034653465347, 3445, 14903, 10200.0, 13454.800000000001, 13870.699999999999, 14620.64, 0.30876038818211976, 0.21867193817073224, 0.8075434738829981], "isController": false}, {"data": ["AAELog-Active-ON/aaeLog?limit=20&isActive=true&fromDate=01/28/2024%2018:30:00&toDate=02/06/2024%2018:29:59", 411, 0, 0.0, 10309.175182481742, 3468, 15205, 11007.0, 13424.8, 13914.8, 14970.88, 0.5639298915772749, 4.8234078756719825, 1.476822758018507], "isController": false}, {"data": ["AAELog-Focus-ON", 203, 0, 0.0, 9747.960591133018, 0, 17332, 10270.0, 13526.4, 13917.6, 14891.960000000003, 0.3120388588293163, 0.21881688948751846, 0.8080868549787876], "isController": true}, {"data": ["AAELog-No Ticket-ON/aaeLog?limit=20&noTicket=true&fromDate=03/16/2024%2018:30:00&toDate=03/24/2024%2018:29:59", 106, 0, 0.0, 8170.207547169812, 2488, 14424, 8754.0, 11503.2, 12349.249999999996, 14335.169999999991, 0.16205299744537208, 1.3518833572909326, 0.4243067146315511], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 842, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
