(function(global, _) {
  var Code4AVL  = global.Code4AVL || (global.Code4AVL = {});
  var Dashboard = global.Code4AVL.Dashboard;
  var Chart     = Dashboard.Chart || (Dashboard.Chart = {});

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
  
}(this, _));
