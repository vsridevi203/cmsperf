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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9739820396112683, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "AAEM_AAELogic-SeaarchCode/static/media/triangle.46e96035.svg-24"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM_AAELogic-ApplyFilter-clear/static/media/cross_icon.8e849f86.svg-37"], "isController": false}, {"data": [0.9768392370572208, 500, 1500, "AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38"], "isController": false}, {"data": [0.9715447154471545, 500, 1500, "AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35"], "isController": false}, {"data": [0.9059139784946236, 500, 1500, "AAEM_AAELogic-ApplyFilter"], "isController": true}, {"data": [0.9720930232558139, 500, 1500, "AAEM_AAELogic-Home/cms/customLogicalarmdetails"], "isController": false}, {"data": [0.9672185430463576, 500, 1500, "AAELogicBuilder-Home"], "isController": true}, {"data": [0.9847457627118644, 500, 1500, "AAEM_AAELogic-SeaarchCode_Clear/cms/customLogicalarmdetails"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM_AAELogic-Home/train.png"], "isController": false}, {"data": [1.0, 500, 1500, "AAEM_AAELogic-SeaarchCode/static/media/drop_down_up_icon.dd969bb4.svg"], "isController": false}, {"data": [0.8484848484848485, 500, 1500, "AAELogicBuilder-searchByAAECode"], "isController": true}, {"data": [0.9986486486486487, 500, 1500, "AAEM_AAELogic-ApplyFilter/static/media/cross_icon.8e849f86.svg-33"], "isController": false}, {"data": [0.9728813559322034, 500, 1500, "AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=20&search=CL05133"], "isController": false}, {"data": [0.9728813559322034, 500, 1500, "AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=-1&fields=AAECode,TagName,CreatedDate,UpdatedDate,ShortDescription,Version,Type,%20Severity,%20Status,RuleParameters"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 5970, 0, 0.0, 234.5450586264659, 0, 35997, 42.0, 189.0, 320.4499999999998, 2050.74, 3.0912189188811343, 9.19598945655517, 5.748160434294252], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["AAEM_AAELogic-SeaarchCode/static/media/triangle.46e96035.svg-24", 293, 0, 0.0, 28.255972696245735, 6, 235, 21.0, 41.60000000000002, 70.90000000000003, 182.4600000000001, 0.15977498447237992, 0.18598806786237976, 0.17194694219717324], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter-clear/static/media/cross_icon.8e849f86.svg-37", 368, 0, 0.0, 28.589673913043463, 5, 280, 21.0, 40.10000000000002, 51.0, 237.27000000000004, 0.20063308461373225, 0.2650943002757615, 0.21336911556929092], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter-clear/cms/customLogicalarmdetails-38", 367, 0, 0.0, 343.675749318801, 31, 28882, 56.0, 260.4, 385.1999999999996, 13715.88, 0.20013469555804586, 1.0914409911098204, 0.5149982370628188], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter/cms/customLogicalarmdetails-35", 369, 0, 0.0, 432.77777777777766, 24, 30247, 54.0, 295.0, 416.5, 16975.600000000053, 0.199942130570339, 0.1824722758087903, 0.5174204280102669], "isController": false}, {"data": ["AAEM_AAELogic-ApplyFilter", 372, 0, 0.0, 925.793010752688, 0, 30567, 203.5, 567.7, 930.6499999999974, 24718.529999999955, 0.2000645369474024, 1.7819277219802085, 1.4435388893930836], "isController": true}, {"data": ["AAEM_AAELogic-Home/cms/customLogicalarmdetails", 1505, 0, 0.0, 393.83521594684413, 32, 34699, 53.0, 299.8000000000002, 419.10000000000014, 13593.880000000001, 0.7817028552670672, 4.263216410539951, 2.0115832992041693], "isController": false}, {"data": ["AAELogicBuilder-Home", 1510, 0, 0.0, 436.0781456953641, 0, 34719, 79.0, 345.0, 459.8000000000002, 13613.67, 0.7833681093436621, 5.158135810382636, 2.81500825324994], "isController": true}, {"data": ["AAEM_AAELogic-SeaarchCode_Clear/cms/customLogicalarmdetails", 295, 0, 0.0, 128.62033898305086, 31, 1092, 56.0, 313.20000000000044, 440.5999999999999, 929.0400000000011, 0.16008100641572115, 0.8729480972608783, 0.4119197801178847], "isController": false}, {"data": ["AAEM_AAELogic-Home/train.png", 1501, 0, 0.0, 28.689540306462355, 5, 354, 21.0, 39.799999999999955, 53.899999999999864, 230.84000000000015, 0.7801585057547734, 0.9051057664420614, 0.8091924354056305], "isController": false}, {"data": ["AAEM_AAELogic-SeaarchCode/static/media/drop_down_up_icon.dd969bb4.svg", 292, 0, 0.0, 28.828767123287687, 6, 395, 21.0, 37.0, 49.349999999999966, 217.44999999999908, 0.16109864864715756, 0.18689960409455386, 0.17479651640723531], "isController": false}, {"data": ["AAELogicBuilder-searchByAAECode", 297, 0, 0.0, 1330.7205387205381, 0, 36990, 339.0, 759.5999999999999, 1616.799999999991, 27776.399999999907, 0.15946642641107653, 2.3781302291363415, 1.5802339074147056], "isController": true}, {"data": ["AAEM_AAELogic-ApplyFilter/static/media/cross_icon.8e849f86.svg-33", 370, 0, 0.0, 32.45945945945947, 13, 1242, 18.0, 42.0, 76.89999999999998, 325.10000000000184, 0.20035446495340137, 0.26472616316596875, 0.21305429822599659], "isController": false}, {"data": ["AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=20&search=CL05133", 295, 0, 0.0, 535.0067796610166, 36, 32139, 53.0, 298.0, 480.3999999999999, 23853.28000000001, 0.15997917559205854, 0.14927082373006362, 0.413060638886328], "isController": false}, {"data": ["AAELogicBuilder-searchAAECode-/customLogicalarmdetails?limit=-1&fields=AAECode,TagName,CreatedDate,UpdatedDate,ShortDescription,Version,Type,%20Severity,%20Status,RuleParameters", 295, 0, 0.0, 415.8915254237288, 34, 35997, 56.0, 264.80000000000024, 449.79999999999944, 14580.68000000026, 0.16008091954821366, 1.0122548006300676, 0.42880097135881023], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 5970, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
