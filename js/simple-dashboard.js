/****************************************************************************************
 GoogleDashboard Class
 ****************************************************************************************/
function GoogleDashboard(key) {
	this.containerSelector = "body";
	this.spreadsheetKey    = key;
	this.widgetWorksheet   = "1";
	this.dataWorksheet     = "2";
	this.widgets           = {};
	
	this.show         = _Dashboard_show;
	this.loadWidgets  = _Dashboard_loadWidgets;
	this.loadData     = _Dashboard_loadData;
	this.build        = _Dashboard_build;
	this.getContainer = _Dashboard_getContainer;
}

function _Dashboard_show() {
	this.loadWidgets();
}

function _Dashboard_loadWidgets() {
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
					widget = new Widget(row['Widget']);
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
//		  d3.select('body').append('h2').text("Could not load widget parameters.");
		}
	});
}	

function _Dashboard_loadData() {
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
//		  d3.select('body').append('h2').text("Could not load data.");
		}
	});
}	

function _Dashboard_getContainer() {
	return d3.select(this.containerSelector);
}

function _Dashboard_build() {
	var container = this.getContainer();
	var widgets   = this.widgets;
	
	for (var name in widgets)
	{
		var widget = widgets[name];
		
		widget.build(container);
	}
}



/****************************************************************************************
 WidgetGroup Class
 ****************************************************************************************/
function WidgetGroup(title, description) {
	this.title 		 = title
	this.description = description;
	this.widgets     = {};
}


/****************************************************************************************
 Widget Class
 ****************************************************************************************/
function Widget(name, parent, title, description, chartType, data, options) {
	this.name        = name;
	this.parent      = parent;
	this.title       = title;
	this.description = description;
	this.chartType   = chartType;
	this.chart       = null;
	this.options     = options;
	this.data        = data;

	this.addData    = _Widget_addData;
	this.build      = _Widget_build;
	this.addChart   = _Widget_addChart; 
	this.addText    = _Widget_addText;
}

function _Widget_addData(row) {
	if (this.data == null) {
		this.data = [];
	}

	this.data.push(row);
}

function _Widget_build(container) {
	var options   = this.options;
	var widgetBox = container.append('div').attr('class', 'widget');

	this.addText(widgetBox, options['title'], 'h2', 'title');
	this.addChart(widgetBox);
	this.addText(widgetBox, options['description'], 'h3', 'description');
}

function _Widget_addText(container, text, tag, className, id) {
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
}

function _Widget_addChart(parent) {
	var chartType = this.options['control.type'];
	var chart     = null;
	
	if (chartType == 'stoplight') {
		chart = new StoplightChart(parent, this.data, this.options);
	}
	else if (chartType == 'pie') {
		chart = new PieChart(parent, this.data, this.options);
	}
	
	if (chart != null) {
		chart.draw();
	}
}


/****************************************************************************************
 Stoplight Chart Class
 ****************************************************************************************/
function StoplightChart(parent, data, options) {
	this.parent      = parent;
	this.width       = 200;
	this.height      = 200;
	this.radius      = 60;
	this.data        = data;
	this.options     = options;
	this.colorScheme = new ColorScheme(options);
	
	this.draw     = _StoplightChart_draw; 
	this.getColor = _StoplightChart_getColor;
}

function _StoplightChart_draw() {
	var widget = this.parent.append('svg').attr('class', 'stoplightChart');
	var group  = widget.append('g');
	var width  = getLength(widget, 'width');
	var height = getLength(widget, 'height');
	
	
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
//		.attr("dx", -3) // padding-right
		.attr("dy", ".4em") 			// vertical-align: middle
		.attr("text-anchor", "middle") 	// text-align: right
		.text(this.data['Value']);
}

function _StoplightChart_getColor(value) {
	return this.colorScheme.getColor(this.data[0]['Value']);
}



/****************************************************************************************
 PieChart Class
 ****************************************************************************************/
function PieChart(parent, data, options) {
	this.parent      = parent;
	this.width       = 200;
	this.height      = 200;
	this.radius      = 60;
	this.innerRadius = 0;
	this.data        = data;
	this.options     = options;
	this.colorScheme = new ColorScheme(options);
	
	this.draw        = _PieChart_draw; 
	this.prepareData = _PieChart_prepareData;
	this.getColor    = _PieChart_getColor;
}

function _PieChart_draw() {
	var widget  = this.parent.append('svg').attr('class', 'pieChart');
	var width   = getLength(widget, 'width');
	var height  = getLength(widget, 'height');
	var color   = d3.scale.ordinal().range(this.colorScheme.colors);
//	var color   = d3.scale.ordinal().range(['red', 'blue', 'green']);
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
//				.data(pie)
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

}

function _PieChart_getColor(value) {
	return this.colorScheme.getColor(this.data['Value']);
}

function _PieChart_prepareData(data) {
	var values = [];
	
	/**
	 * @todo Add error handling to ensure Value is numeric. [twl 1.Jun.13]
	 */ 
	for (var i = 0; i < data.length; i++) {
		values[i] = { "label" : data[i]['Category'], "value" : +data[i]['Value'] };
	}

	return values;	
}



/****************************************************************************************
 ColorScheme Class
 ****************************************************************************************/
function ColorScheme(options) {
	this.style  = 'discrete';
	this.values = [];
	this.colors = [];
	
	this.parseOptions    = _ColorScheme_parseOptions;
	this.parseColorPoint = _ColorScheme_parseColorPoint;
	this.getColor        = _ColorScheme_getColor;
	
	this.parseOptions(options);
}

function _ColorScheme_parseOptions(options) {
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
	
}

function _ColorScheme_parseColorPoint(options, index) {
	var value = options['colors[' + index + '].value'];
	var color = options['colors[' + index + '].color'];
	
	// configuration color points are 1-based
	//
	this.values[index - 1] = value != null ? +value : null;
	this.colors[index - 1] = color;
}

function _ColorScheme_getColor(value) {
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


/****************************************************************************************
 General Functions
 ****************************************************************************************/
function getLength(element, property) {
	var value = element.style(property);

	if (value != null && value.lastIndexOf('px') == value.length - 2) {
		value = value.substring(0, value.length - 2);
	}
	
	return value != null ? +value : null;
}