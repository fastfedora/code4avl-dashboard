(function(global, _) {
  var Code4AVL = global.Code4AVL || (global.Code4AVL = {});

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

}(this, _));
