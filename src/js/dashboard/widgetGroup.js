(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;

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
  Dashboard.WidgetGroup = function(options) {
    _.extend(this, options);
    
    this.widgets = widgets || {};
    
    return this;
  };
  
}(this, _));
