'use strict';
/**
 * Counties constructor
 *
 * @param {string} selector
 * @param {opts} object
 */

function Counties(selector, opts) {
  var $select = $(selector).selectize(opts);
  if($select[0] && $select[0].selectize) {
    this.dropdown =  $select[0].selectize;
    return this;
  }
}

Counties.prototype.change = function(districts) {

  if(this && this.dropdown) {
    this.dropdown.on('change', handler);
  }

  function handler( event ) {

    var options = {
      url: '/v1/county/' + event + '/districts',
      data: {id: event}
    };
    //console.log(defaultId);
    if(event !== '') {
        districts.fetchDistrictsfromcounties(options);
        $('#btn-county').attr({
          disabled: false,
          href: '/counties/'+ event + '/reports'
        });

        $('#btn-county-woq').attr({
          disabled: false,
          href: '/format/counties/'+ event + '/reports'
        });
    } else {
      districts.clear();
      districts.clearOptions();
        $('#btn-county').attr({
          disabled: true
        });

        $('#btn-county-woq').attr({
          disabled: true
        });
    }
  }

  return this;
};
Counties.prototype.setValue = function(countyId) {
    this.dropdown.setValue(countyId);
};
Counties.prototype.clearOptions = function() {
  this.dropdown.clearOptions();
};
Counties.prototype.clear = function() {
  this.dropdown.clear();
};


exports = module.exports = Counties;
