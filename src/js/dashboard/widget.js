(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;

  /**
   * A widget used to display data on the dashboard.
   *
   * <dl>
   * <dt>title</dt><dd>the title of the group</dd>
   * <dt>description</dt><dd>the description of the group</dd>
   * </dl>
   *
   * @param {Object} options the options used to create this object
   * @returns {Object} an instance of this object
   */
  Dashboard.Widget = function(options) {
    _.extend(this, options);

    return this;
  };
  
  _.extend(Dashboard.Widget.prototype, {
  
    /**
     * Adds data to the widget.
     */
    addData : function (row) {
      if (this.data == null) {
        this.data = [];
      }
    
      this.data.push(row);
    },
    
    /**
     * Adds the widget to its container.
     */
    build: function (container) {
      var options   = this.options;
      var widgetBox = container.append('div').attr('class', 'widget');
    
      this.addText(widgetBox, options['title'], 'h2', 'title');
      this.addChart(widgetBox);
      this.addText(widgetBox, options['description'], 'h3', 'description');
    },

    /**
     * Adds text to the container.
     */
    addText : function (container, text, tag, className, id) {
      if (text == null) {
        return;
      }
    
      var element = container.append(tag);
      
      if (className != null) {
        element.attr('class', className);
      }
      
      if (id != null) {
        element.attr('id', id);
      }
      
      element.text(text);
    },


    /**
     * Adds the chart to the container.
     */
    addChart: function (parent) {
      var chartType = this.options['control.type'];
      var chart     = null;
      
      if (chartType == 'stoplight') {
        chart = new Code4AVL.Dashboard.Chart.Stoplight({parent: parent, data: this.data, options: this.options});
//        chart = new StoplightChart(parent, this.data, this.options);
      }
      else if (chartType == 'pie') {
        chart = new Code4AVL.Dashboard.Chart.Pie({parent: parent, data: this.data, options: this.options});
//        chart = new PieChart(parent, this.data, this.options);
      }
      
      if (chart != null) {
        chart.draw();
      }
    }

  });  
  
}(this, _));
