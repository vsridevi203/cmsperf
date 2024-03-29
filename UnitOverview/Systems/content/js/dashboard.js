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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7350894632206759, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9157303370786517, 500, 1500, "UnitOverview_Systems_UF1_LoadSystemsTab"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_Systems_UF4_ViewSelectedUnit"], "isController": true}, {"data": [0.4782608695652174, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&fromDate=11/29/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false"], "isController": false}, {"data": [0.8466666666666667, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL70101&unitNumber=R01"], "isController": false}, {"data": [0.8260869565217391, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R01&fromDate=11/29/2023&system=BMU-CCS&component=HVAC%20Control&filter=Status=Open"], "isController": false}, {"data": [0.9637681159420289, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=1448"], "isController": false}, {"data": [0.9207317073170732, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01"], "isController": false}, {"data": [0.95, 500, 1500, "UnitOverview_Systems_UF3_ViewSystemWithFilter"], "isController": true}, {"data": [0.5289855072463768, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL70101&unitNumber=R01"], "isController": false}, {"data": [0.4533333333333333, 500, 1500, "UnitOverview_Systems_UF2_ViewSystemForSelectedCar"], "isController": true}, {"data": [0.4855072463768116, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL70101&unitNumber=R01"], "isController": false}, {"data": [0.95, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 713, 0, 0.0, 608.0645161290317, 41, 23762, 385.0, 742.6, 863.7999999999997, 8927.16000000002, 0.3961951925353047, 14.392586761815563, 1.0359056060786234], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["UnitOverview_Systems_UF1_LoadSystemsTab", 89, 0, 0.0, 504.741573033708, 227, 12848, 274.0, 736.0, 982.0, 12848.0, 0.04970831273789477, 6.8774043647319525, 0.1282153319426176], "isController": true}, {"data": ["UnitOverview_Systems_UF4_ViewSelectedUnit", 69, 0, 0.0, 3614.463768115942, 2410, 43757, 2660.0, 3337.0, 4362.5, 43757.0, 0.038336357645992074, 0.37510554652089223, 0.6056966542638363], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&fromDate=11/29/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false", 69, 0, 0.0, 940.4347826086955, 640, 10304, 688.0, 862.0, 1770.5, 10304.0, 0.038401987553303624, 0.1379821414757049, 0.10392113946627916], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401", 75, 0, 0.0, 948.2533333333334, 323, 18293, 385.0, 800.2, 3317.2000000000207, 18293.0, 0.04174793598204505, 1.2561682140539139, 0.10877837850738326], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL70101&unitNumber=R01", 69, 0, 0.0, 62.1304347826087, 41, 213, 52.0, 88.0, 166.5, 213.0, 0.038423671654690364, 0.0948002513757345, 0.10034442784368582], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R01&fromDate=11/29/2023&system=BMU-CCS&component=HVAC%20Control&filter=Status=Open", 69, 0, 0.0, 585.8695652173911, 433, 5864, 483.0, 574.0, 821.0, 5864.0, 0.038406070162880696, 0.028515376482460393, 0.10273308501350614], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=1448", 69, 0, 0.0, 368.2028985507246, 99, 13555, 128.0, 293.0, 640.0, 13555.0, 0.038393376307948264, 0.026810591981348608, 0.09917419464328937], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01", 164, 0, 0.0, 593.1402439024389, 212, 23762, 270.0, 661.5, 904.0, 16667.899999999936, 0.091273374888691, 12.63118210586181, 0.23542558732886243], "isController": false}, {"data": ["UnitOverview_Systems_UF3_ViewSystemWithFilter", 60, 0, 0.0, 262.6333333333334, 56, 6210, 84.0, 479.99999999999994, 615.6499999999997, 6210.0, 0.0343315812783021, 0.1565590512853744, 0.08905256798082238], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL70101&unitNumber=R01", 69, 0, 0.0, 739.608695652174, 460, 6345, 555.0, 697.0, 761.5, 6345.0, 0.038411158608580825, 0.02026403896533699, 0.10027043334467112], "isController": false}, {"data": ["UnitOverview_Systems_UF2_ViewSystemForSelectedCar", 75, 0, 0.0, 1646.2933333333335, 548, 33974, 642.0, 1484.0000000000005, 7885.800000000006, 33974.0, 0.04173457809958538, 7.032996983355138, 0.21639107035142185], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL70101&unitNumber=R01", 69, 0, 0.0, 918.2173913043479, 579, 7632, 711.0, 857.0, 976.5, 7632.0, 0.038402671490190624, 0.06743186482537916, 0.10036132948379017], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD", 60, 0, 0.0, 262.6333333333334, 56, 6210, 84.0, 479.99999999999994, 615.6499999999997, 6210.0, 0.03433653235359761, 0.15658162920407917, 0.08906541055762528], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 713, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
