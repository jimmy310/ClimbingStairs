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
        <h1>����ֿn�����~</h1>
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
                        <li class="list-group-item list-group-item-success">����:<span id="todaySum">0</span>�h��</li>
                        <li class="list-group-item list-group-item-warning">���P:<span id="weekSum">0</span>�h��</li>
                        <li class="list-group-item list-group-item-primary">����:<span id="monthSum">0</span>�h��</li>
                    </ul>
                    <div class="btn-group special btn-group-lg mt-3">
                        <button type="button" class="btn btn-primary" onclick="removeAll()">�M�Ŭ���</button>
                        <button type="button" class="btn btn-primary" onclick="location.reload()">��������</button>
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
                addMessage("1. �ˬd���a�x�s�Ŷ�..");
                if (typeof (Storage) !== "undefined") {
                    refreshArray();
                    showArray(10);
                    addMessage("<span style='color:blue'>Ok!</span>")
                } else {
                    addMessage("<span style='color:red'>Failed, �L�k�s��localStorage<span>")
                }
                addMessage(' (�x�s�Ŷ�:'+localStorageSpace()+')');
                addMessage("<br>");
                addMessage("2. �}�Ҭ۾�..");
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
            var newScan = JSON.parse(str);//���X�W������
            var lastObject;//�s�bstorage���̫�@������

            if(existedArray && existedArray.length > 0){
                lastObject = existedArray[existedArray.length-1];
            }
            //if(lastScanStr == str){
            //    //showErrorMessage('�w��L�����X.');
            //    return;
            //}
            lastScanStr = str;
            
            //addMessage("��d: �Ӽh" + (newScan.lv + ", ") + (newScan.inOut == 'in' ? '�i' : '�X') + '<br>');
            if (newScan != null) {
                if (newScan.inOut == 'in') {
                    if(lastObject != null && lastObject.el == null){
                        showErrorMessage('�|�������}���X.');
                        return;
                    }
                    var newObject = new Object;
                    //newObject.st = new Date().toLocaleDateString().slice(5,10) +' '+ new Date().toLocaleTimeString();//start time
                    newObject.st = new Date()//start time
                    newObject.sl = newScan.lv;//start level
                    newObject.v = newScan.ver;
                    existedArray.push(newObject)
                    showMessage('����X���\, �q'+newScan.lv+'�Ӷi�J');
                    
                } else if (newScan.inOut == 'out') {
                    if (lastObject == null) {
                        showErrorMessage('�L�k�s�����, �Х���i�J���X, �A�����}���X');
                    }else{
                        if(lastObject.el){
                            showErrorMessage('�|����i�J���X.');
                        }else{
                            //lastObject.et = new Date().toLocaleDateString().slice(5,10) +' '+ new Date().toLocaleTimeString();//end time
                            lastObject.et = new Date();//end time
                            lastObject.el = newScan.lv;//end level
                            lastObject.diff = Math.abs(lastObject.el - lastObject.sl);//diff
                            showMessage('����X���\, �q'+newScan.lv+'�����}');
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
            if(confirm("�O�_�M���Ҧ�����?")){
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
                result += "<thead class='thead-dark'><tr><td>No</td><td>�}�l�ɶ�</td><td>�Ӽh(�t��)</td></tr></thead>";
                var min = Math.min(existedArray.length, topNo);
                for (var i = (existedArray.length - 1); i >= 0; i--) {
                    var existedScan = existedArray[i];
                    var exitInfo = existedScan.el!=null ? existedScan.el + " ("+existedScan.diff+")" : "";
                    result += `<tr><td>${(i+1)}</td><td>${new Date(existedScan.st).toLocaleString().slice(5,20)}</td><td>${existedScan.sl}��${exitInfo}</td><td></td></tr>`;
                }
                result += "</table>";
                list.innerHTML = result;
                
            } else {
                list.innerHTML = "�|�L��d����";
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
        //////���U�Ojsqrscanner���w�]function
        function onQRCodeScanned(scannedText)
        {
            if(scannedText=='Requested device not found'){
                showErrorMessage("<span style='color:red'>Failed, �䤣��۾�<span><br>");
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

            return Promise.reject('�ܩ�p, �z���˸m���䴩�۾��^���\��');
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
                  addMessage("<span style='color:red'>Failed, �䤣��۾�<span><br>");
                  return Promise.reject('Could not find a webcam');
                }

                addMessage("<span style='color:blue'>Ok, �w�}��, �Ш���X<span><br>");
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