'use strict';

var common = require('./common');
var Teachers = require('./teachers');

/**
 * Schools constructor
 *
 * @param {string} selector
 * @param {opts} object
 */
function Schools(selector, opts) {
  var $select = $(selector).selectize(opts);
  if($select[0] && $select[0].selectize) {
    this.dropdown =  $select[0].selectize;
    var self = this;
    self.disable();
    return this;
  }
}

Schools.prototype.disable = function() {
  this.dropdown.disable();
};

Schools.prototype.enable = function() {
  this.dropdown.enable();
};

Schools.prototype.clear = function() {
  this.dropdown.clear();
};

Schools.prototype.clearOptions = function() {
  this.dropdown.clearOptions();
};

Schools.prototype.fetchSchoolsfromdistricts = function(options) {
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
      var teacher = new Teachers('#e4', {placeholder: 'Select Teacher'});
      teacher.clear();
      $('.alert').text('No school found');
      $('.alert').css({'display':'block'});
      $('#btn-schools').attr({
        disabled: true
      });
      $('#btn-teachers').attr({
        disabled: true
      });
      $('#btn-teachers').attr({
        disabled: true
      });
    }

  }, function(err) {
    console.log(err);
  });

};

Schools.prototype.addOption = function(data) {
  this.dropdown.addOption(data);
};

Schools.prototype.open = function() {
  this.dropdown.open();
};

Schools.prototype.change = function(teachers) {

  if(this && this.dropdown) {
    this.dropdown.on('change', handler);
  }

  function handler( schoolId ) {

    $('.alert').text('');
    $('.alert').css({'display':'none'});

    var countyId = $('#e1').find('option:selected').val();
    var distId = $('#e2').find('option:selected').val();

    var options = {
      url: '/v1/districts/' + distId + '/schools/' + schoolId + '/teachers' ,
      data: {id: schoolId}
    };
    if(schoolId !== '') {
        teachers.fetchTeachersfromSchools(options);
        $('#btn-schools').attr({
          disabled: false,
          href: '/counties/'+countyId+'/districts/'+ distId + '/schools/' + schoolId + '/reports'
        });

        $('#btn-schools-woq').attr({
          disabled: false,
          href: '/format/counties/'+countyId+'/districts/'+ distId + '/schools/' + schoolId + '/reports'
        });
        $('#btn-teachers').attr({
          disabled: true
        });
        $('#btn-teachers-woq').attr({
          disabled: true
        });
    } else {
        teachers.clear();
        teachers.clearOptions();
        $('#btn-schools').attr({
          disabled: true
        });

        $('#btn-schools-woq').attr({
          disabled: true
        });
        $('#btn-teachers').attr({
          disabled: true
        });
        $('#btn-teachers-woq').attr({
          disabled: true
        });
    }
  }
};

exports = module.exports = Schools;