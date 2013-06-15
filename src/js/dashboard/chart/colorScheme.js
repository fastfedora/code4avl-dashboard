(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;
  var Chart     = Dashboard.Chart || (Dashboard.Chart = {});

  Chart.ColorScheme = function(options) {
    _.extend(this, options);

    this.style  = 'discrete';
    this.values = [];
    this.colors = [];
    
    this._initialize(options);
    
    return this;
  };

  _.extend(Chart.ColorScheme.prototype, {
  
    _initialize : function (options) {
      var index = 1;
    
      if (options['colors.type'] != null) {
        this.style = options['colors.type'];
      }
      
      if (this.style == 'discrete') {
        while (options['colors[' + index + '].color'] != null) {
          this.parseColorPoint(options, index++);
        }
      } else if (this.style == 'category') {
        while (options['colors[' + index + '].color'] != null) {
          this.colors[index - 1] = options['colors[' + index + '].color'];
          index++;
        }
      }
      
    },
    
    parseColorPoint : function (options, index) {
      var value = options['colors[' + index + '].value'];
      var color = options['colors[' + index + '].color'];
      
      // configuration color points are 1-based
      //
      this.values[index - 1] = value != null ? +value : null;
      this.colors[index - 1] = color;
    },
    
    getColor : function (value) {
      var myValue = value != null ? +value : null;
      var color   = this.colors[0];
    
      for (var i = 0; i < this.values.length; i++) {
        if (this.values[i] != null && myValue >= this.values[i]) {
          color = this.colors[i];     
        } else {
          break;
        }
      }
    
      return color != null ? color : "invalid value " + value;
    }
  
  });

}(this, _));
