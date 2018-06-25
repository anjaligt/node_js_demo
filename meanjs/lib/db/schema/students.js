'use strict';

exports = module.exports = function StudentsSchema() {
  return {
    teacherId : '',
    schoolId  : '',
    firstName  : '',
    lastName : '',
    gender : '',
    dob : '',
    preSchool: '',
    firstLanguage: '',
    iep: '',
    transitionalKindergarten: '',
    active : true,
    enabled : true,
    created : '',
    createdIso : '',
    updated : '',
    updatedIso : ''
  };
};