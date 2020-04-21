         Array.prototype.sum = function (prop) {
            var total = 0
            for ( var i = 0, _len = this.length; i < _len; i++ ) {
                total += this[i][prop]
            }
            return total
        }
        function getMonday(d) {
          d = new Date(d);
          var day = d.getDay(),
              diff = d.getDate() - day + (day == 0 ? -6:1); // adjust when day is sunday
          return new Date(d.setDate(diff));
        }
        
        function localStorageSpace (){
            var data = '';
            //console.log('Current local storage: ');
            for(var key in window.localStorage){
                if(window.localStorage.hasOwnProperty(key)){
                    data += window.localStorage[key];
                    //console.log( key + " = " + ((window.localStorage[key].length * 16)/(8 * 1024)).toFixed(2) + ' KB' );
                }
            }
            var used = data ? ((data.length * 16)/(8 * 1024)).toFixed(2) : 0;
            var total = data ? (5120 - ((data.length * 16)/(8 * 1024)).toFixed(0)) : 1024*5;
            //console.log(data ? '\n' + 'Total space used: ' + ((data.length * 16)/(8 * 1024)).toFixed(2) + ' KB' : 'Empty (0 KB)');
            //console.log(data ? 'Approx. space remaining: ' + (5120 - ((data.length * 16)/(8 * 1024)).toFixed(2)) + ' KB' : '5 MB');

            return used+'/'+total+' KB';
        };