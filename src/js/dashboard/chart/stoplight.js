(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;
  var Chart     = Dashboard.Chart || (Dashboard.Chart = {});

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
  
}(this, _));
