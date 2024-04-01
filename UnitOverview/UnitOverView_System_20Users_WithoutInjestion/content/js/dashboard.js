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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7679900744416873, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9933333333333333, 500, 1500, "UnitOverview_Systems_UF1_LoadSystemsTab"], "isController": true}, {"data": [0.0, 500, 1500, "UnitOverview_Systems_UF4_ViewSelectedUnit"], "isController": true}, {"data": [0.8492063492063492, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401"], "isController": false}, {"data": [0.839622641509434, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R01&fromDate=12/4/2023&system=BMU-CCS&component=HVAC%20Control&filter=Status=Open"], "isController": false}, {"data": [0.9905660377358491, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=1452"], "isController": false}, {"data": [0.9963768115942029, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01"], "isController": false}, {"data": [0.99, 500, 1500, "UnitOverview_Systems_UF3_ViewSystemWithFilter"], "isController": true}, {"data": [0.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL70103&unitNumber=R01"], "isController": false}, {"data": [0.9607843137254902, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL70103&unitNumber=R01"], "isController": false}, {"data": [1.0, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL70103&unitNumber=R01"], "isController": false}, {"data": [0.49206349206349204, 500, 1500, "UnitOverview_Systems_UF2_ViewSystemForSelectedCar"], "isController": true}, {"data": [0.99, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD"], "isController": false}, {"data": [0.5, 500, 1500, "https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&fromDate=12/4/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 567, 0, 0.0, 1640.9647266313932, 54, 22508, 330.0, 1445.3999999999985, 13417.6, 17086.80000000003, 0.3752824546517154, 9.088740737282755, 0.9907908479976992], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["UnitOverview_Systems_UF1_LoadSystemsTab", 75, 0, 0.0, 262.8799999999999, 210, 1299, 237.0, 296.80000000000007, 368.00000000000006, 1299.0, 0.05001046885814764, 3.8368409391199227, 0.1289202164653134], "isController": true}, {"data": ["UnitOverview_Systems_UF4_ViewSelectedUnit", 53, 0, 0.0, 15697.77358490566, 12900, 26401, 15251.0, 19089.600000000002, 21088.099999999988, 26401.0, 0.035074367585990106, 1.2313150406167794, 0.5468762925400791], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&filter=carNumber=RIA2401", 63, 0, 0.0, 508.44444444444474, 426, 1547, 481.0, 541.2, 607.9999999999999, 1547.0, 0.04208908857080821, 0.6599613713610475, 0.10960569664122392], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=10&unit=R01&fromDate=12/4/2023&system=BMU-CCS&component=HVAC%20Control&filter=Status=Open", 53, 0, 0.0, 502.01886792452837, 438, 899, 486.0, 544.2, 644.2999999999997, 899.0, 0.03539626789765536, 0.02650350343744511, 0.09459462152874477], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/alarmDetail?alarmTxId=1452", 53, 0, 0.0, 177.41509433962267, 118, 1305, 143.0, 195.8, 300.2999999999997, 1305.0, 0.03537996412605147, 0.025872641808570365, 0.09134043878164755], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01", 138, 0, 0.0, 242.47101449275362, 190, 1299, 228.0, 271.40000000000003, 305.29999999999956, 962.0399999999872, 0.09203380708513594, 7.061027344461198, 0.237248607655212], "isController": false}, {"data": ["UnitOverview_Systems_UF3_ViewSystemWithFilter", 50, 0, 0.0, 123.85999999999996, 76, 1141, 94.0, 150.9, 172.45, 1141.0, 0.034551862345380414, 0.15980303818844588, 0.08956962956084584], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourLocation?AaeCode=AL70103&unitNumber=R01", 53, 0, 0.0, 13782.716981132075, 11181, 22508, 13424.0, 17252.0, 18768.499999999993, 22508.0, 0.03514973455318387, 0.9512416343217261, 0.09181015848053665], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailBehaviourFleet?AaeCode=AL70103&unitNumber=R01", 51, 0, 0.0, 447.3725490196078, 402, 780, 429.0, 490.20000000000005, 667.3999999999999, 780.0, 0.03525434976462537, 0.019238543848461596, 0.09197899277113014], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/aaeDetailMaintenancePlan?AaeCode=AL70103&unitNumber=R01", 51, 0, 0.0, 78.43137254901963, 54, 265, 71.0, 94.80000000000001, 135.19999999999996, 265.0, 0.035270392511058304, 0.0881982684052665, 0.0920525907486452], "isController": false}, {"data": ["UnitOverview_Systems_UF2_ViewSystemForSelectedCar", 63, 0, 0.0, 726.6190476190478, 631, 1764, 706.0, 769.4000000000001, 816.9999999999999, 1764.0, 0.04207624215077721, 3.888005352156441, 0.21803701014571739], "isController": true}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/systems?unitNumber=R01&system=BMU-BOD", 50, 0, 0.0, 123.85999999999996, 76, 1141, 94.0, 150.9, 172.45, 1141.0, 0.03455711600132699, 0.15982733644980923, 0.08958324874039311], "isController": false}, {"data": ["https://integra-cms-webapp-uat.australiaeast.cloudapp.azure.com/cms/serviceNotification?limit=-1&unit=R01&fromDate=12/4/2023&system=BMU-CCS&state=submitted&filter=Status=Closed&isServiceHistory=true&isSnOnly=false", 53, 0, 0.0, 729.6415094339624, 650, 1420, 717.0, 776.8000000000001, 819.8, 1420.0, 0.035401422068444974, 0.12857280920303382, 0.09571860399000745], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 567, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
