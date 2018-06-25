'use strict';
var common = require('./common');

/**
 * Districts constructor
 *
 * @param {string} selector
 * @param {opts} object
 */
function Districts(selector, opts) {
  var $select = $(selector).selectize(opts);
  if($select[0] && $select[0].selectize) {
    this.dropdown =  $select[0].selectize;
    return this;
  }
}

Districts.prototype.change = function(schools) {

  if(this && this.dropdown) {
    this.dropdown.on('change', handler);
  }

  function handler( event ) {
    $('.alert').text('');
    $('.alert').css({'display':'none'});
    var countyId = $('#e1').find('option:selected').val();

    var options = {
      url: '/v1/districts/' + event + '/schools',
      data: {id: event}
    };
    if(typeof schools !== 'undefined') {
        if(event !== '') {
            schools.fetchSchoolsfromdistricts(options);
            $('#btn-dist').attr({
              disabled: false,
              href: '/counties/'+countyId+'/districts/'+ event + '/reports'
            });

            $('#btn-dist-woq').attr({
              disabled: false,
              href: '/format/counties/'+countyId+'/districts/'+ event + '/reports'
            });
        } else {
            schools.clear();
            schools.clearOptions();
            $('#btn-dist').attr({
              disabled: true
            });

            $('#btn-dist-woq').attr({
              disabled: true
            });
        }
    } else {
        $('#schoolName').focus();
    }

  }

  return this;
};

Districts.prototype.fetchDistrictsfromcounties = function(options) {
  var url = options.url;
  var data = options.data;
  var self = this;

  common.doAjax(url, data, function(err, response) {

    if(response.length>0) {
      var schoolsOptions = $.map(response, function(val) {
        var obj = {
          value: val._id,
          text: val.name
        };
        return obj;
      });

      self.enable();
      self.clear();
      self.clearOptions();
      self.addOption(schoolsOptions);
      self.open();
    } else {
      self.disable();
      self.clear();
      $('.alert').text('No district found');
      $('.alert').css({'display':'block'});
    }

  }, function(err) {
    console.log(err);
  });

};

Districts.prototype.addOption = function(data) {
  this.dropdown.addOption(data);
};

Districts.prototype.open = function() {
  this.dropdown.open();
};

Districts.prototype.disable = function() {
  this.dropdown.disable();
};

Districts.prototype.enable = function() {
  this.dropdown.enable();
};

Districts.prototype.clear = function() {
  this.dropdown.clear();
};

Districts.prototype.clearOptions = function() {
  this.dropdown.clearOptions();
};

Districts.prototype.blur = function() {
  this.dropdown.blur();
};

Districts.prototype.setValue = function(districtId) {
    this.dropdown.setValue(districtId);
};

exports = module.exports = Districts;