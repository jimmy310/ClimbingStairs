<!DOCTYPE html>
<html>
<head>
    <title>Instascan</title>
    <script type="text/javascript" src="js/jsqrscanner.nocache.js"></script>
    <script type="text/javascript" src="js/lib.js"></script>
    <!--<script type="text/javascript" src="instascan.min.js"></script>-->
    <meta charset="UTF-8" />
    <!--<meta name="viewport" content="width=device-width, initial-scale=1">-->
</head>
<body>
    <div class="container-fluid">
        <img class="mt-3" src="https://www.cgmh.org.tw/images/00-logo-icon/logo.svg" />
        <hr class="my-1" />
        <h1>爬梯累積換獎品</h1>
        <div class="row">
            <div class="col-12" id='message'>
                <div id="message"></div>
            </div>
            <div class="col-12">
                <div id='currentMessage'>&nbsp;</div>
            </div>
            <div class="col-6">
                <div class="qrscanner" id="scanner">
                </div>
                <!--<video id="preview" style="width:100%"></video>-->
            </div>
            <div class="col-6 pr-2">
                <div class="mr-2">
                    <ul class="list-group shadow-lg">
                        <li class="list-group-item list-group-item-success">本日:<span id="todaySum">0</span>層樓</li>
                        <li class="list-group-item list-group-item-warning">本周:<span id="weekSum">0</span>層樓</li>
                        <li class="list-group-item list-group-item-primary">本月:<span id="monthSum">0</span>層樓</li>
                    </ul>
                    <div class="btn-group special btn-group-lg mt-3">
                        <button type="button" class="btn btn-primary" onclick="removeAll()">清空紀錄</button>
                        <button type="button" class="btn btn-primary" onclick="location.reload()">重載網頁</button>
                    </div>
                </div>
            </div>
            <div class="col-12 mt-2">
                <div id='stairHistory' style="font-size:18px">
                </div>
            </div>
        </div>
    </div>
    <style>
        body{
            font-size:36px;
        }
        table, button {
            font-size: 42px!important
        }
        #currentMessage {
            font-size: 46px
        }
        .list-group {
            font-size: 60px
        }
        .btn-group.special {
            display: flex;
        }
        .special .btn {
            flex: 1
        }
    </style>
    
    <script type="text/javascript">
        var jbScanner
        var lastScanStr="";
        var existedArray;
        var barcodeStorageKey = 'barcode'
         

        main();

        function main(){
            try {
                //addMessage(navigator.userAgent.toLowerCase() + "<br>");
                addMessage("1. 檢查本地儲存空間..");
                if (typeof (Storage) !== "undefined") {
                    refreshArray();
                    showArray(10);
                    addMessage("<span style='color:blue'>Ok!</span>")
                } else {
                    addMessage("<span style='color:red'>Failed, 無法存取localStorage<span>")
                }
                addMessage(' (儲存空間:'+localStorageSpace()+')');
                addMessage("<br>");
                addMessage("2. 開啟相機..");
                window.addEventListener('focus', resumeCarmera);
                window.addEventListener('blur', stopCarmera);
            }
            catch (e) {
                alert(e);
            }
        }
        
         function resumeCarmera() {
            if(jbScanner) jbScanner.appendTo(document.getElementById("scanner"))
         }

         // Stop timer
         function stopCarmera() {
            if(jbScanner) jbScanner.removeFrom(document.getElementById("scanner"))
         }
        //enter staircase
        function scan(str) {
            var newScan = JSON.parse(str);//條碼上的物件
            var lastObject;//存在storage的最後一筆物件

            if(existedArray && existedArray.length > 0){
                lastObject = existedArray[existedArray.length-1];
            }
            //if(lastScanStr == str){
            //    //showErrorMessage('已刷過此條碼.');
            //    return;
            //}
            lastScanStr = str;
            
            //addMessage("刷卡: 樓層" + (newScan.lv + ", ") + (newScan.inOut == 'in' ? '進' : '出') + '<br>');
            if (newScan != null) {
                if (newScan.inOut == 'in') {
                    if(lastObject != null && lastObject.el == null){
                        showErrorMessage('尚未刷離開條碼.');
                        return;
                    }
                    var newObject = new Object;
                    //newObject.st = new Date().toLocaleDateString().slice(5,10) +' '+ new Date().toLocaleTimeString();//start time
                    newObject.st = new Date()//start time
                    newObject.sl = newScan.lv;//start level
                    newObject.v = newScan.ver;
                    existedArray.push(newObject)
                    showMessage('刷條碼成功, 從'+newScan.lv+'樓進入');
                    
                } else if (newScan.inOut == 'out') {
                    if (lastObject == null) {
                        showErrorMessage('無法存取資料, 請先刷進入條碼, 再刷離開條碼');
                    }else{
                        if(lastObject.el){
                            showErrorMessage('尚未刷進入條碼.');
                        }else{
                            //lastObject.et = new Date().toLocaleDateString().slice(5,10) +' '+ new Date().toLocaleTimeString();//end time
                            lastObject.et = new Date();//end time
                            lastObject.el = newScan.lv;//end level
                            lastObject.diff = Math.abs(lastObject.el - lastObject.sl);//diff
                            showMessage('刷條碼成功, 從'+newScan.lv+'樓離開');
                        }
                    }
                }
                //store array
                localStorage.setItem(barcodeStorageKey, JSON.stringify(existedArray));
                refreshArray()
                showArray(10);
            }
        }
        function refreshArray(){
            var existed = localStorage.getItem(barcodeStorageKey);
            existedArray = JSON.parse(existed);
            if (existedArray == null) {
                existedArray = new Array();
            }
        }
        function removeAll(){
            if(confirm("是否清除所有紀錄?")){
                localStorage.removeItem(barcodeStorageKey);
                refreshArray();
                showArray();
            }
        }
        function showArray(topNo){
            if(!topNo){
                topNo = existedArray.length;
            }
            //console.log(topNo);
            var list = document.getElementById("stairHistory");
            if (existedArray.length > 0) {
                var result = "<table class='table table-striped table-sm'>";
                result += "<thead class='thead-dark'><tr><td>No</td><td>開始時間</td><td>樓層(差異)</td></tr></thead>";
                var min = Math.min(existedArray.length, topNo);
                for (var i = (existedArray.length - 1); i >= 0; i--) {
                    var existedScan = existedArray[i];
                    var exitInfo = existedScan.el!=null ? existedScan.el + " ("+existedScan.diff+")" : "";
                    result += `<tr><td>${(i+1)}</td><td>${new Date(existedScan.st).toLocaleString().slice(5,20)}</td><td>${existedScan.sl}→${exitInfo}</td><td></td></tr>`;
                }
                result += "</table>";
                list.innerHTML = result;
                
            } else {
                list.innerHTML = "尚無刷卡紀錄";
            }
            showSummary();
        }
        function showSummary(){
            if (existedArray == null || existedArray.length == 0) {
                return;
            }
            var date = new Date();
            var firstDateOfWeek = getMonday(new Date());
            var todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            var weekStart =  new Date(firstDateOfWeek.getFullYear(), firstDateOfWeek.getMonth(), firstDateOfWeek.getDate())
            var monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
            var todayArray = existedArray.filter(a=> new Date(a.st) >= todayStart);
            var weekArray =  existedArray.filter(a=> new Date(a.st) >= weekStart);
            var monthArray =  existedArray.filter(a=> new Date(a.st) >= monthStart);
            document.getElementById("todaySum").innerHTML = todayArray.sum('diff');
            document.getElementById("weekSum").innerHTML = weekArray.sum('diff');
            document.getElementById("monthSum").innerHTML = monthArray.sum('diff');
        }
       

        function addMessage(str){
            document.getElementById("message").innerHTML += str;
        }
        function showMessage(str){
            document.getElementById("currentMessage").innerHTML = "<span class='text-primary'>" + new Date().toLocaleTimeString() + ": " +str + "</span>";
        }
        function showErrorMessage(str){
            document.getElementById("currentMessage").innerHTML = "<span class='text-danger'>" + new Date().toLocaleTimeString() + ": " +str + "</span>";
        }
        //////底下是jsqrscanner的預設function
        function onQRCodeScanned(scannedText)
        {
            if(scannedText=='Requested device not found'){
                showErrorMessage("<span style='color:red'>Failed, 找不到相機<span><br>");
                return;
            }
            scan(scannedText);
        }

        function provideVideo()
        {
            var n = navigator;
            if (n.mediaDevices && n.mediaDevices.getUserMedia)
            {
              showMessage("<span style='color:blue'>Ok<span><br>");
              return n.mediaDevices.getUserMedia({
                video: {
                  facingMode: "environment"
                },
                audio: false
              });
            }

            return Promise.reject('很抱歉, 您的裝置不支援相機擷取功能');
        }

        function provideVideoQQ()
        {
            return navigator.mediaDevices.enumerateDevices()
            .then(function(devices) {
                var exCameras = [];
                devices.forEach(function(device) {
                if (device.kind === 'videoinput') {
                  exCameras.push(device.deviceId)
                }
             });

                return Promise.resolve(exCameras);
            }).then(function(ids){
                if(ids.length === 0)
                {
                  addMessage("<span style='color:red'>Failed, 找不到相機<span><br>");
                  return Promise.reject('Could not find a webcam');
                }

                addMessage("<span style='color:blue'>Ok, 已開啟, 請刷條碼<span><br>");
                return navigator.mediaDevices.getUserMedia({
                    video: {
                      'optional': [{
                        'sourceId': ids.length === 1 ? ids[0] : ids[1]//this way QQ browser opens the rear camera
                        }]
                    }
                });
            });
        }
        
        //this function will be called when JsQRScanner is ready to use
        function JsQRScannerReady()
        {
            //create a new scanner passing to it a callback function that will be invoked when
            //the scanner succesfully scan a QR code
            jbScanner = new JsQRScanner(onQRCodeScanned);
            //var jbScanner = new JsQRScanner(onQRCodeScanned, provideVideo);
            //reduce the size of analyzed image to increase performance on mobile devices
            //alert(jbScanner.getSnapImageMaxSize());
            //jbScanner.setSnapImageMaxSize(300);
            
            jbScanner.setScanInterval(1500);//scanIntervalMilliseconds  : Sets the interval at which the scanner attempts to decode a qr code. Default:300
        
    	    var scannerParentElement = document.getElementById("scanner");
    	    if(scannerParentElement)
    	    {
    	        //append the jbScanner to an existing DOM element
    		    jbScanner.appendTo(scannerParentElement);
    	    }
        }


    </script>

</body>
</html>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css">
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.16.0/umd/popper.min.js"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js"></script>
19