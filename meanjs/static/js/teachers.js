'use strict';

var common = require('./common');

/**
 * Teachers constructor
 *
 * @param {string} selector
 * @param {opts} object
 */

function Teachers(selector, opts) {
  var $select = $(selector).selectize(opts);
  if($select[0] && $select[0].selectize) {
    this.dropdown =  $select[0].selectize;
    var self = this;
    self.disable();
  }
}

Teachers.prototype.disble = function() {
  this.dropdown.disable();
};

Teachers.prototype.disable = function() {
  this.dropdown.disable();
};

Teachers.prototype.enable = function() {
  this.dropdown.enable();
};

Teachers.prototype.clear = function() {
  this.dropdown.clear();
};

Teachers.prototype.clearOptions = function() {
  this.dropdown.clearOptions();
};

Teachers.prototype.fetchTeachersfromSchools = function(options) {
  var url = options.url;
  var data = options.data;
  var self = this;

  common.doAjax(url, data, function(err, response) {

    if(response.length > 0) {
      var teachersOptions = $.map(response, function(val) {
        var obj = {
          value: val._id,
          text: val.firstName + ' ' + val.lastName
        };
        return obj;
      });
      self.enable();
      self.clear();
      self.clearOptions();
      self.addOption(teachersOptions);
      self.open();
    } else {
      self.disable();
      self.clear();
      $('.alert').text('No teacher found');
      $('.alert').css({'display':'block'});
      $('#btn-teachers').attr({
        disabled: true
      });
    }

  }, function(err) {
    console.log(err);
  });

};

Teachers.prototype.addOption = function(data) {
  this.dropdown.addOption(data);
};

Teachers.prototype.open = function() {
  this.dropdown.open();
};

Teachers.prototype.change = function() {

  if(this && this.dropdown) {
    this.dropdown.on('change', handler);
  }

  function handler(teacherId) {

    $('.alert').text('');
    $('.alert').css({'display':'none'});

    var countyId = $('#e1').find('option:selected').val();
    var distId = $('#e2').find('option:selected').val();
    var schoolId = $('#e3').find('option:selected').val();
    
    if(teacherId !== '') {
        $('#btn-teachers').attr({
          disabled: false,
          href: '/counties/'+countyId+'/districts/'+ distId + '/schools/' + schoolId + '/teachers/' + teacherId + '/reports'
        });

        $('#btn-teachers-woq').attr({
          disabled: false,
          href: '/format/counties/'+countyId+'/districts/'+ distId + '/schools/' + schoolId + '/teachers/' + teacherId + '/reports'
        });
    } else {
        $('#btn-teachers').attr({
          disabled: true
        });
        $('#btn-teachers-woq').attr({
          disabled: true
        });
    }
  }
};

exports = module.exports = Teachers;