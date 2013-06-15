(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;
  var Chart     = Dashboard.Chart || (Dashboard.Chart = {});

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
