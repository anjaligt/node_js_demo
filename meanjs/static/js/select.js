'use strict';

var Counties = require('./counties');
var Districts = require('./districts');
var Schools = require('./schools');
var Teachers = require('./teachers');

var counties = new Counties('#e1', {placeholder: 'Select County'});

var districts = new Districts('#e2', {placeholder: 'Select District'});

var schools = new Schools('#e3', {placeholder: 'Select School'});

var teachers = new Teachers('#e4', {placeholder: 'Select Teacher'});


//districts.disable();
counties.change(districts);
if (!$('#e3')[0]){
  districts.change();
} else {
  districts.change(schools);
}
if (!$('#e4')[0]){
  schools.change();
} else {
  schools.change(teachers);
}
teachers.change();