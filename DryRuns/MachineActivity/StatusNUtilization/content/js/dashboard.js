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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9907407407407407, 2000, 4000, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 2000, 4000, "MA_SU WB_UtilHoursGraph-Week-Month-UF8"], "isController": true}, {"data": [0.967741935483871, 2000, 4000, "MA_SU WB_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437-UF7"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-UF4"], "isController": true}, {"data": [0.9838709677419355, 2000, 4000, "MA_SU TWP_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175-UF10"], "isController": false}, {"data": [0.9838709677419355, 2000, 4000, "MA_SU WB_Home-/wbUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF7"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF4"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_UtilHoursGraph-Week-Month-UF14"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU WB_UtilHoursGraph-Week-Month-/wbUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF8"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_Home-/wbUtilisationStatusDetails-UF7"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Export-Excel/simulatorAAELogDetails?limit=-1&sort=-UF15"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Home-/twpUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-/ufwlAAELogDetails?limit=10&sort=-UF4"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Export-Excel-UF12"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_Home-/tcmsUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=1142217-UF3"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted-UF13"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Home-/twpAAELogDetails?limit=10&sort=UF10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Home-/simulatorUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10&simulatorNo=1-UF13"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_UtilHoursGraph-Week-Month-UF5"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_Home-/tcmsUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF2"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834-UF6"], "isController": false}, {"data": [0.967741935483871, 2000, 4000, "MA_SU WB_Home-UF7"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU TWP_UtilHoursGraph-Week-Month-UF11"], "isController": true}, {"data": [0.9736842105263158, 2000, 4000, "MA_SU TCMS_Home-/tcmsUtilisationStatusDetails-UF1"], "isController": false}, {"data": [0.9848484848484849, 2000, 4000, "MA_SU SIM_Home-UF13"], "isController": true}, {"data": [0.9411764705882353, 2000, 4000, "MA_SU WB_Export-Excel-UF9"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-/ufwlUtilisationStatusDetails-UF4"], "isController": false}, {"data": [0.967741935483871, 2000, 4000, "MA_SU TWP_Home-UF10"], "isController": true}, {"data": [0.9210526315789473, 2000, 4000, "MA_SU TCMS_Home-UF1"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Export-Excel/twpAAELogDetails?limit=-1&sort=-UF12"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Export-Excel-UF6"], "isController": true}, {"data": [0.9868421052631579, 2000, 4000, "MA_SU TCMS_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422174-UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_Export-Excel-UF3"], "isController": true}, {"data": [0.9868421052631579, 2000, 4000, "MA_SU TCMS_Home-/tcmsAAELogDetails?limit=10&sort=UF1"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Home-/twpUtilisationStatusDetails-UF10"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Home-/simulatorUtilisationStatusDetails?simulatorNo=1-UF13"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_UtilHoursGraph-Week-Month-UF2"], "isController": true}, {"data": [0.9705882352941176, 2000, 4000, "MA_SU WB_Export-Excel/wbAAELogDetails?limit=-1&sort=undefined-UF9"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Export-Excel/serviceNotific-UF15ation?limit=-1&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Export-Excel-UF15"], "isController": true}, {"data": [1.0, 2000, 4000, "MA_SU TWP_UtilHoursGraph-Week-Month-/twpUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF11"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_UtilHoursGraph-Week-Month-/simulatorUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10&simulatorNo=1-UF14"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TCMS_Export-Excel/tcmsAAELogDetails?limit=-1&sort="], "isController": false}, {"data": [0.9705882352941176, 2000, 4000, "MA_SU WB_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437-UF9"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU SIM_Home-/simulatorAAELogDetails?limit=10&sort=-UF13"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU TWP_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175-UF12"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Export-Excel/ufwlAAELogDetails?limit=-1&sort=-UF6"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU WB_Home-/wbAAELogDetails?limit=10&sort=-UF7"], "isController": false}, {"data": [1.0, 2000, 4000, "MA_SU UFWL_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834-UF4"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 908, 0, 0.0, 391.3149779735684, 87, 5266, 247.0, 747.1, 809.55, 1925.4899999999925, 0.41205244320324486, 0.5370439415017133, 1.0764712311496218], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["MA_SU WB_UtilHoursGraph-Week-Month-UF8", 16, 0, 0.0, 213.4375, 151, 616, 169.5, 461.3000000000002, 616.0, 616.0, 0.007606323326739601, 0.00402553891395014, 0.019802253123703064], "isController": true}, {"data": ["MA_SU WB_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437-UF7", 31, 0, 0.0, 872.4516129032259, 657, 5266, 721.0, 809.0, 2595.9999999999936, 5266.0, 0.017024940989357765, 0.03514880158831716, 0.04571537755140709], "isController": false}, {"data": ["MA_SU UFWL_Home-UF4", 32, 0, 0.0, 1247.2499999999998, 1126, 1669, 1207.0, 1450.0, 1570.8499999999997, 1669.0, 0.016455809466410093, 0.06580616335630633, 0.1716540598667491], "isController": true}, {"data": ["MA_SU TWP_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175-UF10", 31, 0, 0.0, 779.7096774193549, 669, 2305, 709.0, 865.0, 1479.9999999999982, 2305.0, 0.01703644920829972, 0.02881716671621892, 0.04574574274247264], "isController": false}, {"data": ["MA_SU WB_Home-/wbUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF7", 31, 0, 0.0, 226.77419354838707, 136, 2527, 147.0, 168.4, 1126.5999999999967, 2527.0, 0.017031254549679894, 0.008618102376244587, 0.044318603541512035], "isController": false}, {"data": ["MA_SU UFWL_Home-/ufwlUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF4", 32, 0, 0.0, 135.81250000000006, 119, 224, 130.0, 152.9, 179.79999999999984, 224.0, 0.016466309416361954, 0.008332149549337694, 0.04288134911303195], "isController": false}, {"data": ["MA_SU SIM_UtilHoursGraph-Week-Month-UF14", 22, 0, 0.0, 178.6818181818182, 101, 1302, 119.0, 209.49999999999997, 1139.6999999999975, 1302.0, 0.010456129644600907, 0.005516295313657749, 0.027434344417306036], "isController": true}, {"data": ["MA_SU WB_UtilHoursGraph-Week-Month-/wbUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF8", 16, 0, 0.0, 213.4375, 151, 616, 169.5, 461.3000000000002, 616.0, 616.0, 0.007606464353731018, 0.004025613550488382, 0.01980262027246355], "isController": false}, {"data": ["MA_SU WB_Home-/wbUtilisationStatusDetails-UF7", 31, 0, 0.0, 177.6774193548387, 103, 1456, 123.0, 219.8, 731.7999999999984, 1456.0, 0.017030599592474233, 0.010704749044500958, 0.043717094203388214], "isController": false}, {"data": ["MA_SU SIM_Export-Excel/simulatorAAELogDetails?limit=-1&sort=-UF15", 18, 0, 0.0, 144.5, 123, 208, 139.5, 194.50000000000003, 208.0, 208.0, 0.00875734704928489, 0.008762098214133677, 0.022573259313073697], "isController": false}, {"data": ["MA_SU TWP_Home-/twpUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF10", 31, 0, 0.0, 166.96774193548384, 95, 1708, 106.0, 178.20000000000002, 813.3999999999979, 1708.0, 0.017041759457214464, 0.008623418036833289, 0.044360971127411344], "isController": false}, {"data": ["MA_SU UFWL_Home-/ufwlAAELogDetails?limit=10&sort=-UF4", 32, 0, 0.0, 254.15624999999997, 212, 740, 232.0, 285.6, 455.9499999999991, 740.0, 0.016465013133420633, 0.019537631398522777, 0.04236344168941325], "isController": false}, {"data": ["MA_SU TWP_Export-Excel-UF12", 14, 0, 0.0, 1017.7142857142858, 926, 1179, 994.5, 1151.5, 1179.0, 1179.0, 0.007632264416529741, 0.031452212416276784, 0.04012528856092564], "isController": true}, {"data": ["MA_SU TCMS_Home-/tcmsUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10-UF1", 38, 0, 0.0, 487.1315789473684, 420, 1470, 444.5, 540.0, 781.249999999998, 1470.0, 0.01960840973732987, 0.009924137062268053, 0.051060879468137366], "isController": false}, {"data": ["MA_SU TCMS_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=1142217-UF3", 15, 0, 0.0, 569.5999999999999, 484, 848, 530.0, 791.0, 848.0, 848.0, 0.007606814894752109, 0.005719968231405395, 0.02041805802706606], "isController": false}, {"data": ["MA_SU SIM_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted-UF13", 33, 0, 0.0, 748.8181818181819, 673, 961, 723.0, 859.2, 934.3999999999999, 961.0, 0.016484134021004786, 0.05817008551144524, 0.0441020829951172], "isController": false}, {"data": ["MA_SU TWP_Home-/twpAAELogDetails?limit=10&sort=UF10", 31, 0, 0.0, 299.90322580645164, 221, 1464, 255.0, 327.8, 802.7999999999984, 1464.0, 0.017040981912371973, 0.019026698649199845, 0.043829637387144724], "isController": false}, {"data": ["MA_SU SIM_Home-/simulatorUtilisationHoursGraphDetails?viewType=Day&numberOfRecords=10&simulatorNo=1-UF13", 33, 0, 0.0, 103.81818181818181, 87, 156, 96.0, 138.60000000000002, 154.6, 156.0, 0.016488573418620898, 0.008308695199226937, 0.04324542154786733], "isController": false}, {"data": ["MA_SU UFWL_UtilHoursGraph-Week-Month-UF5", 17, 0, 0.0, 221.64705882352942, 147, 867, 170.0, 414.1999999999996, 867.0, 867.0, 0.008157961162346307, 0.004338603196289184, 0.021251563809172813], "isController": true}, {"data": ["MA_SU TCMS_Home-/tcmsUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF2", 18, 0, 0.0, 474.0555555555555, 438, 550, 466.5, 543.7, 550.0, 550.0, 0.008786368242550625, 0.004676338566591885, 0.022887840972104254], "isController": false}, {"data": ["MA_SU UFWL_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834-UF6", 15, 0, 0.0, 749.6, 706, 844, 737.0, 828.4, 844.0, 844.0, 0.007596017458686527, 0.012779705935376121, 0.020394021092368077], "isController": false}, {"data": ["MA_SU WB_Home-UF7", 31, 0, 0.0, 1599.2903225806454, 1236, 9604, 1337.0, 1437.8, 4715.799999999988, 9604.0, 0.017018818970822608, 0.07083257760855947, 0.1774264418165009], "isController": true}, {"data": ["MA_SU TWP_UtilHoursGraph-Week-Month-UF11", 17, 0, 0.0, 279.3529411764706, 112, 1698, 123.0, 1234.7999999999995, 1698.0, 1698.0, 0.00815411077503384, 0.0043524814637875935, 0.021236380986196526], "isController": true}, {"data": ["MA_SU TCMS_Home-/tcmsUtilisationStatusDetails-UF1", 38, 0, 0.0, 475.92105263157873, 233, 4811, 272.0, 494.20000000000164, 2090.1999999999916, 4811.0, 0.019593446301582326, 0.012155268136312637, 0.05033358567414861], "isController": false}, {"data": ["MA_SU SIM_Home-UF13", 33, 0, 0.0, 1185.1818181818187, 1001, 2573, 1092.0, 1347.4, 1986.3999999999976, 2573.0, 0.016469383416229232, 0.0911630474260849, 0.17232418059826782], "isController": true}, {"data": ["MA_SU WB_Export-Excel-UF9", 17, 0, 0.0, 1322.9411764705883, 998, 5177, 1077.0, 2036.199999999997, 5177.0, 5177.0, 0.008085212431822636, 0.025875187832563814, 0.0425667299037289], "isController": true}, {"data": ["MA_SU UFWL_Home-/ufwlUtilisationStatusDetails-UF4", 32, 0, 0.0, 119.24999999999997, 96, 247, 110.0, 160.39999999999998, 210.59999999999988, 247.0, 0.016465292706595688, 0.010164685246634648, 0.04229833602137813], "isController": false}, {"data": ["MA_SU TWP_Home-UF10", 31, 0, 0.0, 1417.5483870967741, 1136, 6665, 1200.0, 1468.0, 3573.1999999999925, 6665.0, 0.017031404261257346, 0.06698765054937267, 0.1776070075232108], "isController": true}, {"data": ["MA_SU TCMS_Home-UF1", 38, 0, 0.0, 2065.447368421053, 1581, 9163, 1674.0, 2142.200000000002, 6679.6999999999925, 9163.0, 0.0195761858789759, 0.09156616055357332, 0.2041951339719463], "isController": true}, {"data": ["MA_SU TWP_Export-Excel/twpAAELogDetails?limit=-1&sort=-UF12", 14, 0, 0.0, 266.42857142857144, 229, 415, 257.0, 355.0, 415.0, 415.0, 0.0076354779209248085, 0.018542770913574026, 0.019638879560425537], "isController": false}, {"data": ["MA_SU UFWL_Export-Excel-UF6", 15, 0, 0.0, 991.0666666666666, 936, 1119, 978.0, 1088.4, 1119.0, 1119.0, 0.007595117453428005, 0.028623109955021715, 0.03993024216905415], "isController": true}, {"data": ["MA_SU TCMS_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422174-UF1", 38, 0, 0.0, 806.1842105263156, 673, 3761, 714.5, 798.6, 1081.999999999992, 3761.0, 0.019606629104493012, 0.051328332997956784, 0.05264545184250718], "isController": false}, {"data": ["MA_SU TCMS_Export-Excel-UF3", 15, 0, 0.0, 807.2666666666667, 711, 1086, 750.0, 1050.0, 1086.0, 1086.0, 0.007605835196762957, 0.019026967280964622, 0.03998460848329505], "isController": true}, {"data": ["MA_SU TCMS_Home-/tcmsAAELogDetails?limit=10&sort=UF1", 38, 0, 0.0, 296.2105263157894, 206, 2383, 226.5, 266.1000000000001, 661.5999999999949, 2383.0, 0.01961150638044877, 0.01829809186494072, 0.0504560836441069], "isController": false}, {"data": ["MA_SU TWP_Home-/twpUtilisationStatusDetails-UF10", 31, 0, 0.0, 170.96774193548387, 107, 1188, 124.0, 195.4, 625.1999999999987, 1188.0, 0.017041225473003952, 0.010550914990121587, 0.043761012376602286], "isController": false}, {"data": ["MA_SU SIM_Home-/simulatorUtilisationStatusDetails?simulatorNo=1-UF13", 33, 0, 0.0, 184.45454545454547, 101, 1236, 125.0, 199.6, 870.5999999999985, 1236.0, 0.016479112724621544, 0.009628420976412397, 0.04263931404444866], "isController": false}, {"data": ["MA_SU TCMS_UtilHoursGraph-Week-Month-UF2", 18, 0, 0.0, 474.0555555555555, 438, 550, 466.5, 543.7, 550.0, 550.0, 0.008786363953649002, 0.004676336283924517, 0.022887829799831987], "isController": true}, {"data": ["MA_SU WB_Export-Excel/wbAAELogDetails?limit=-1&sort=undefined-UF9", 17, 0, 0.0, 459.8235294117647, 295, 2488, 336.0, 844.7999999999986, 2488.0, 2488.0, 0.008088224449180021, 0.009188460863222891, 0.020865463210235316], "isController": false}, {"data": ["MA_SU UFWL_Home-/ufwlUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF5", 17, 0, 0.0, 221.64705882352942, 147, 867, 170.0, 414.1999999999996, 867.0, 867.0, 0.008157961162346307, 0.004338603196289184, 0.021251563809172813], "isController": false}, {"data": ["MA_SU SIM_Export-Excel/serviceNotific-UF15ation?limit=-1&functionalLocation=TFNSW-SM-R&filter=equipment=11436275&isSnOnly=false&sort=-changedDateTime&state=Submitted", 18, 0, 0.0, 754.0000000000001, 706, 860, 743.0, 831.2, 860.0, 860.0, 0.00875433582799481, 0.08373755896409946, 0.023420413086710726], "isController": false}, {"data": ["MA_SU SIM_Export-Excel-UF15", 18, 0, 0.0, 898.5, 846, 1068, 885.0, 992.4000000000001, 1068.0, 1068.0, 0.008753671678954227, 0.09248962705103389, 0.045982421837006626], "isController": true}, {"data": ["MA_SU TWP_UtilHoursGraph-Week-Month-/twpUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10-UF11", 17, 0, 0.0, 279.3529411764706, 112, 1698, 123.0, 1234.7999999999995, 1698.0, 1698.0, 0.00815411077503384, 0.0043524814637875935, 0.021236380986196526], "isController": false}, {"data": ["MA_SU SIM_UtilHoursGraph-Week-Month-/simulatorUtilisationHoursGraphDetails?viewType=Week&numberOfRecords=10&simulatorNo=1-UF14", 22, 0, 0.0, 178.6818181818182, 101, 1302, 119.0, 209.49999999999997, 1139.6999999999975, 1302.0, 0.010456258855144219, 0.005516363480707965, 0.027434683434386736], "isController": false}, {"data": ["MA_SU TCMS_Export-Excel/tcmsAAELogDetails?limit=-1&sort=", 15, 0, 0.0, 237.66666666666669, 212, 273, 230.0, 267.0, 273.0, 273.0, 0.007607918321388902, 0.013311380526518667, 0.019574539847740192], "isController": false}, {"data": ["MA_SU WB_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-WKS1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11417437-UF9", 17, 0, 0.0, 863.1176470588234, 696, 2689, 741.0, 1195.3999999999987, 2689.0, 2689.0, 0.008094902734981932, 0.016710152216312942, 0.021735055648885022], "isController": false}, {"data": ["MA_SU SIM_Home-/simulatorAAELogDetails?limit=10&sort=-UF13", 33, 0, 0.0, 148.0909090909091, 127, 325, 142.0, 166.20000000000002, 226.2999999999996, 325.0, 0.01649004825587758, 0.015142228852387583, 0.04250559787168444], "isController": false}, {"data": ["MA_SU TWP_Export-Excel/serviceNotification?limit=-1&functionalLocation=TFNSW-PL-1076-YAR1&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11422175-UF12", 14, 0, 0.0, 751.2857142857143, 695, 852, 741.0, 839.0, 852.0, 852.0, 0.0076332881151885, 0.01291897806492875, 0.02049742322002626], "isController": false}, {"data": ["MA_SU UFWL_Export-Excel/ufwlAAELogDetails?limit=-1&sort=-UF6", 15, 0, 0.0, 241.46666666666664, 221, 286, 236.0, 279.4, 286.0, 286.0, 0.007598395421510855, 0.01585175669836548, 0.019547070096717443], "isController": false}, {"data": ["MA_SU WB_Home-/wbAAELogDetails?limit=10&sort=-UF7", 31, 0, 0.0, 322.38709677419354, 292, 380, 325.0, 352.8, 364.99999999999994, 380.0, 0.017028578899173783, 0.016396658979087257, 0.043779497893125345], "isController": false}, {"data": ["MA_SU UFWL_Home-/serviceNotification?limit=10&functionalLocation=TFNSW-PL-1076-WKS3&isSnOnly=false&sort=-snCreatedDateTime&state=Submitted&filter=equipment=11416834-UF4", 32, 0, 0.0, 738.0312499999998, 661, 1038, 716.0, 817.3, 1005.4999999999999, 1038.0, 0.016460956155214472, 0.02780247858918289, 0.044200138831447015], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 908, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
