/****************************************************************************************
 * Code4AVL.Dashboard - v0.0.1 - 10-Jun-2013
 *
 * https://github.com/fastfedora/code4avl-dashboard
 *
 * Copyright (c) 2013 Trevor Lohrbeer (Fast Fedora)
 *
 * License: MIT
 * https://github.com/fastfedora/code4avl-dashboard/blob/master/LICENSE
 ****************************************************************************************/
// =======================================================================================
// Code4AVL.Dashboard
// =======================================================================================
(function(global, _) {
  var Code4AVL = global.Code4AVL || (global.Code4AVL = {});

  // ----------------------------------------------
  // Dashboard
  // ----------------------------------------------
  /**
   * The dashboard to display. Options include:
   *
   * <dl>
   * <dt>key</dt><dd>the key of the Google spreadsheet</dd>
   * </dl>
   *
   * @param {Object} options the options used to create this object
   * @returns {Object} an instance of this object
   */
  Code4AVL.Dashboard = function(options) {
    _.extend(this, options);

    this.containerSelector = "body";
    this.spreadsheetKey    = options['key'];
    this.widgetWorksheet   = "1";
    this.dataWorksheet     = "2";
    this.widgets           = {};
    
    return this;
  };
  
  _.extend(Code4AVL.Dashboard.prototype, {
  
    /**
     * Shows the dashboard.
     */
    show : function() {
      this.loadWidgets();
    },

    /**
     * Loads configuration information about the widgets.
     */
    loadWidgets : function () {
      var dashboard = this;
    
      var ds = new Miso.Dataset({
        key: this.spreadsheetKey,
        worksheet: this.widgetWorksheet,
        importer: Miso.Dataset.Importers.GoogleSpreadsheet,
        parser: Miso.Dataset.Parsers.GoogleSpreadsheet
      });
      
      ds.fetch({
        success: function() {
          var rowParser = function(row) { 
            var widget = dashboard.widgets[row['Widget']];
            
            if (widget == null) {
              widget = new Code4AVL.Dashboard.Widget({name: row['Widget']});
              dashboard.widgets[row['Widget']] = widget;
            }
            
            if (widget.options == null) {
              widget.options = {};
            }
            
            widget.options[row['Parameter']] = row['Value'];
          };
      
          this.each(rowParser);
          
          dashboard.loadData();
        },
    
        error: function() {
    //      d3.select('body').append('h2').text("Could not load widget parameters.");
        }
      });
    },
    
    loadData : function () {
      var dashboard = this;
    
      var ds = new Miso.Dataset({
        key: this.spreadsheetKey,
        worksheet: this.dataWorksheet,
        importer: Miso.Dataset.Importers.GoogleSpreadsheet,
        parser: Miso.Dataset.Parsers.GoogleSpreadsheet
      });
      
      ds.fetch({
        success: function() {
          var rowParser = function(row) { 
            var widget = dashboard.widgets[row['Metric']];
            
            if (widget == null) {
              console.log("Warning: Could not find widget named '" + row['Metric'] + "'.");
            } else {
              widget.addData(row);
            }
          };
      
          this.each(rowParser);
          
          dashboard.build();
        },
    
        error: function() {
    //      d3.select('body').append('h2').text("Could not load data.");
        }
      });
    },
    
    build : function () {
      var container = this.getContainer();
      var widgets   = this.widgets;
      
      for (var name in widgets)
      {
        var widget = widgets[name];
        
        widget.build(container);
      }
    },
    
    getContainer : function () {
      return d3.select(this.containerSelector);
    }

  });
  
  
  // ----------------------------------------------
  // Dashboard.WidgetGroup
  // ----------------------------------------------
  /**
   * A group of widgets
   *
   * <dl>
   * <dt>title</dt><dd>the title of the group</dd>
   * <dt>description</dt><dd>the description of the group</dd>
   * </dl>
   *
   * @param {Object} options the options used to create this object
   * @returns {Object} an instance of this object
   */
  Code4AVL.Dashboard.WidgetGroup = function(options) {
    _.extend(this, options);
    
    this.widgets = widgets || {};
    
    return this;
  };


  // ----------------------------------------------
  // Dashboard.Widget
  // ----------------------------------------------
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
  Code4AVL.Dashboard.Widget = function(options) {
    _.extend(this, options);

    return this;
  };
  
  _.extend(Code4AVL.Dashboard.Widget.prototype, {
  
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


// =======================================================================================
// Code4AVL.Dashboard.Chart
// =======================================================================================
(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;
  var Chart     = Dashboard.Chart || (Dashboard.Chart = {});


  // ----------------------------------------------
  // Chart.Util
  // ----------------------------------------------
  Chart.Util = {};

  /**
   * Returns the length set for the given property on the given element.
   */
  Chart.Util.getLength = function (element, property) {
    var value = element.style(property);
  
    if (value != null && value.lastIndexOf('px') == value.length - 2) {
      value = value.substring(0, value.length - 2);
    }
    
    return value != null ? +value : null;
  };


  // ----------------------------------------------
  // Chart.ColorScheme
  // ----------------------------------------------
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


  // ----------------------------------------------
  // Chart.Stoplight
  // ----------------------------------------------
  Chart.Stoplight = function(options) {
    _.extend(this, options);

    this.width       = 200;
    this.height      = 200;
    this.radius      = 60;
    this.colorScheme = new Chart.ColorScheme(options['options']);
    
    return this;
  };

  _.extend(Chart.Stoplight.prototype, {

    /**
     * Draws this chart. 
     */  
    draw : function () {
      var widget = this.parent.append('svg').attr('class', 'stoplightChart');
      var group  = widget.append('g');
      var width  = Chart.Util.getLength(widget, 'width');
      var height = Chart.Util.getLength(widget, 'height');
      
      
      var barHeight = 100;
      
      
      group.append('rect')
        .attr('width', this.radius)
        .attr('height', (+this.data[0]['Value'] /10) * barHeight)
        .attr('x', (width - this.radius) / 2)
        .attr('y', 100)
        .attr('fill', this.getColor())
        .append("title")
        .text(this.data[0]['Value']);
    
    /*
      group.append('rect')
        .attr('width', this.radius)
        .attr('height', 20)
        .attr('cx', width / 2)
        .attr('cy', height / 2)
        .attr('r', this.radius)
        .attr('fill', this.getColor());
    */    
      group.append('text')
        .attr('class', 'value')
        .attr("x",  width / 2)
        .attr("y",  height / 2)
    //    .attr("dx", -3) // padding-right
        .attr("dy", ".4em")       // vertical-align: middle
        .attr("text-anchor", "middle")  // text-align: right
        .text(this.data['Value']);
    },
  
    /**
     * Returns the color for the given value.
     */
    getColor : function (value) {
      return this.colorScheme.getColor(this.data[0]['Value']);
    }
  
  });  
  
  
  // ----------------------------------------------
  // Chart.Pie
  // ----------------------------------------------
  Chart.Pie = function(options) {
    _.extend(this, options);

//    this.parent      = parent;
    this.width       = 200;
    this.height      = 200;
    this.radius      = 60;
    this.innerRadius = 0;
//    this.data        = data;
//    this.options     = options;
    this.colorScheme = new Chart.ColorScheme(options['options']);
    
    return this;
  };

  _.extend(Chart.Pie.prototype, {
  
    /**
     * Draws this chart. 
     */  
    draw : function () {
      var widget  = this.parent.append('svg').attr('class', 'pieChart');
      var width   = Chart.Util.getLength(widget, 'width');
      var height  = Chart.Util.getLength(widget, 'height');
      var color   = d3.scale.ordinal().range(this.colorScheme.colors);
    //  var color   = d3.scale.ordinal().range(['red', 'blue', 'green']);
      var data    = this.prepareData(this.data);
      var xOffset = this.radius + (width - this.radius*2) / 2;
      var yOffset = this.radius + (height - this.radius*2) / 2;
      
    
    
      var vis = widget.append('g')
            .data([data])
            .attr("transform", "translate(" + xOffset + "," +  yOffset + ")");
    
      var arc = d3.svg.arc()              //this will create <path> elements for us using arc data
          .outerRadius( this.radius);
   
      var pie = d3.layout.pie()           //this will create arc data for us given a list of values
          .value(function(d) { return d.value; });    //we must tell it out to access the value of each element in our data array
   
      var arcs = vis.selectAll("g.slice")     //this selects all <g> elements with class slice (there aren't any yet)
          .data(pie)                          //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties) 
          .enter()                            //this will create <g> elements for every "extra" data element that should be associated with a selection. The result is creating a <g> for every object in the data array
              .append("svg:g")                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
                  .attr("class", "slice");    //allow us to style things in the slices (like text)
   
          arcs.append("svg:path")
                  .attr("fill", function(d, i) { return color(i); } ) //set the color for each slice to be chosen from the color function defined above
                  .attr("d", arc)                                    //this creates the actual SVG path using the associated data (pie) with the arc drawing function
                  .append("title")
                  .text(function(d, i) { return data[i].label + " - " + data[i].value; });
   
          arcs.append("svg:text")                                     //add a label to each slice
                  .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                  //we have to make sure to set these before calling arc.centroid
                  d.innerRadius = 0;
                  d.outerRadius =  this.radius;
                  return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
              })
              .attr("text-anchor", "middle")                          //center the text on it's origin
              .text(function(d, i) { return data[i].label; });        //get the label from our original data array
    /*
    
    var legend = vis.append("g")
          .attr("class", "legend")
            .attr("transform", "translate(" + 0 + "," + 80 + ")")
          .selectAll("g")
            .data(color.domain().slice().reverse())
          .enter().append("g")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
    
      legend.append("rect")
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);
    
      legend.append("text")
          .attr("x", 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .text(function(d) { return d; });        
    */
    
    /*
      var group  = widget.append('g')
              .attr("transform", "translate(" + this.radius + "," + this.radius + ")");
    
      var arc = d3.svg.arc()
        .outerRadius(this.radius)
        .innerRadius(this.innerRadius);
      
      var pie = d3.layout.pie()
        .value(function(d) { return d['value']; });
      
      var g = group.selectAll(".arc")
            .data(pie(newdata))
    //        .data(pie)
            .enter().append("g")
            .attr("class", "arc");
      
      g.append("path")
          .attr("d", arc)
          .style("fill", function(d) { return color(d['label']); });
    
      g.append("text")
          .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
          .attr("dy", ".35em")
          .style("text-anchor", "middle")
          .text(function(d) { return d['label']; });
    */
    
    },
    
    /**
     * Returns the color for the given value.
     */
    getColor : function (value) {
      return this.colorScheme.getColor(this.data['Value']);
    },
    
    /**
     * Prepares the data for use by d3.
     */
    prepareData : function (data) {
      var values = [];
      
      /**
       * @todo Add error handling to ensure Value is numeric. [twl 1.Jun.13]
       */ 
      for (var i = 0; i < data.length; i++) {
        values[i] = { "label" : data[i]['Category'], "value" : +data[i]['Value'] };
      }
    
      return values;  
    }
  
  });  
  
}(this, _));
