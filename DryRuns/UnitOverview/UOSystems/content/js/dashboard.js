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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9178082191780822, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "UnitOverview_Systems_UF1_LoadSystemsTab"], "isController": true}, {"data": [0.3271604938271605, 2000, 4000, "UnitOverview_Systems_UF4_ViewSelectedUnit"], "isController": true}, {"data": [0.9554455445544554, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401"], "isController": false}, {"data": [0.9753086419753086, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL71143&unitNumber=R20"], "isController": false}, {"data": [0.9135802469135802, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL71143&unitNumber=R20"], "isController": false}, {"data": [0.9506172839506173, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=27348"], "isController": false}, {"data": [1.0, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01"], "isController": false}, {"data": [0.9556962025316456, 2000, 4000, "UnitOverview_Systems_UF3_ViewSystemWithFilter"], "isController": true}, {"data": [0.9629629629629629, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R20&fromDate=12/8/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false"], "isController": false}, {"data": [0.9814814814814815, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL71143&unitNumber=R20"], "isController": false}, {"data": [0.9554455445544554, 2000, 4000, "UnitOverview_Systems_UF2_ViewSystemForSelectedCar"], "isController": true}, {"data": [0.9753086419753086, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R20&fromDate=12/8/2023&system=BMU-CCS&component=Saloon%20HVAV%20Control&filter=Status=Open"], "isController": false}, {"data": [0.9556962025316456, 2000, 4000, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 750, 0, 0.0, 818.1093333333346, 40, 28794, 417.0, 1314.0999999999995, 2074.6499999999974, 10249.93, 0.34294775945369793, 6.308179747751635, 0.8988897444959171], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["UnitOverview_Systems_UF1_LoadSystemsTab", 84, 0, 0.0, 231.2380952380952, 159, 1459, 195.5, 266.0, 298.0, 1459.0, 0.04107374595496949, 3.788358760651058, 0.10596726578307585], "isController": true}, {"data": ["UnitOverview_Systems_UF4_ViewSelectedUnit", 81, 0, 0.0, 5640.40740740741, 3322, 43917, 3722.0, 5670.399999999998, 23877.399999999983, 43917.0, 0.03918341757768112, 1.7838054330469073, 0.6195915697118954], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401", 101, 0, 0.0, 813.6039603960395, 320, 16265, 388.0, 1132.9999999999989, 3136.099999999997, 16100.360000000033, 0.04812218651968912, 0.952856888548063, 0.1254343615460372], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL71143&unitNumber=R20", 81, 0, 0.0, 1115.691358024692, 937, 3155, 1003.0, 1316.1999999999998, 1986.7999999999956, 3155.0, 0.03923990844021364, 0.02123413448146399, 0.10248294229674576], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL71143&unitNumber=R20", 81, 0, 0.0, 1884.8888888888894, 1085, 10279, 1222.0, 2077.7999999999993, 8390.8, 10279.0, 0.039233617300765876, 1.5496124681287404, 0.10258003491428665], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=27348", 81, 0, 0.0, 1034.4074074074074, 117, 28794, 150.0, 433.39999999999975, 3758.2999999999847, 28794.0, 0.03927428872323651, 0.028513444231479747, 0.10153576030053073], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01", 84, 0, 0.0, 231.2380952380952, 159, 1459, 195.5, 266.0, 298.0, 1459.0, 0.04107870729220409, 3.7888163601453404, 0.10598006567091554], "isController": false}, {"data": ["UnitOverview_Systems_UF3_ViewSystemWithFilter", 79, 0, 0.0, 697.6075949367089, 44, 22420, 60.0, 816.0, 2674.0, 22420.0, 0.03792324622987728, 0.17308059694909883, 0.09840983013145925], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R20&fromDate=12/8/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false", 81, 0, 0.0, 856.3209876543211, 605, 3913, 672.0, 1006.9999999999998, 2163.299999999999, 3913.0, 0.039267110885958134, 0.14264957784825927, 0.10627078490591649], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL71143&unitNumber=R20", 81, 0, 0.0, 160.1975308641975, 40, 3025, 51.0, 107.99999999999997, 370.39999999999935, 3025.0, 0.03925780454847709, 0.01453945430561183, 0.1025689659058084], "isController": false}, {"data": ["UnitOverview_Systems_UF2_ViewSystemForSelectedCar", 101, 0, 0.0, 813.6039603960395, 320, 16265, 388.0, 1132.9999999999989, 3136.099999999997, 16100.360000000033, 0.04812214066339945, 0.9528559805577023, 0.12543424201791858], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R20&fromDate=12/8/2023&system=BMU-CCS&component=Saloon%20HVAV%20Control&filter=Status=Open", 81, 0, 0.0, 588.9012345679013, 405, 4019, 453.0, 614.0, 1062.199999999997, 4019.0, 0.039272955769924484, 0.029735021488609875, 0.10532779084654069], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD", 79, 0, 0.0, 697.6075949367089, 44, 22420, 60.0, 816.0, 2674.0, 22420.0, 0.03792324622987728, 0.17308059694909883, 0.09840983013145925], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 750, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
