'use strict';

exports = module.exports = function AssessmentsSchema() {
  return {
    teacherId : '',
    schoolId  : '',
    studentId  : '',
    active : true,
    enabled : true,
    created : '',
    createdIso : '',
    updated : '',
    updatedIso : '',
    parentPresent : ''
  };
};