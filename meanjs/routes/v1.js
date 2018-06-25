'use strict';
var express        = require('express');
var router         = express.Router();
var errorHandler   = require('../errors/errorHandler');
var schools        = require('../routes/api/schools');
var teachers       = require('../routes/api/teachers');
var students       = require('../routes/api/students');
var literacy       = require('../routes/api/literacy');
var numeracy       = require('../routes/api/numeracy');
var social         = require('../routes/api/social');
var classReports   = require('../routes/api/classReports');
var teacherReports = require('../routes/api/teacherReports');
var common         = require('../routes/api/version');
var districts      = require('../routes/api/districts');

//students routes

//schools routes
router.get('/schools',
  common.isOldApp,
  schools.getSchools
);

router.get('/all_teachers',teachers.getAllTeachersList);

router.get('/getlanguages',
  common.isOldApp,
  students.getLanguages
  //schools.getSchools
);
/*router.get('/getlanguages',
    common.isOldApp,
    students.getLanguages
);*/

router.post('/login',
  common.isOldApp,
  teachers.extractLoginParams,
  teachers.doLogin
);

router.post('/resetpassword',
  common.isOldApp,
  teachers.extractResetPasswordParams,
  teachers.resetPassword
);

router.post('/forgotpassword',
  common.isOldApp,
  teachers.extractForgotPasswordParams,
  teachers.processForgotPassword,
  teachers.sendForgotPasswordEmail
);

//teachers routes
//router.post('/schools/:id/teachers',
router.post('/schools/teachers/addteacher',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.extractParams,//change here
  teachers.validations,
  teachers.getTeacher,
  //schools.getSchoolId,//no need for this, as the school name, district name and county name will come as text fields
  teachers.processCountyMasterData,//new function
  teachers.processDistrictMasterData,//new function
  teachers.processSchoolMasterData,//new function
  teachers.create,//big change here
  teachers.updateTeacherCount,
  teachers.sendEmail,
  teachers.sendResponse
);

router.get('/schools/:id/teachers',
  common.isOldApp,
  schools.getSchoolId,
  teachers.getTeachersList,
  teachers.teachersRes
);

router.put('/teachers/:id',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  teachers.extractParams,
  teachers.edit,
  teachers.teachersRes
);

//students routes

router.post('/teachers/:id/students',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.extractParams,
  students.findStudent,
  students.validations,
  students.create
);
///teachers/:id/
router.put('/teachers/:id/students/:sid',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getId,
  students.extractParams,
  students.isStudentExists,
  students.isDupName,
  students.edit,
  students.studentRes
);

///teachers/:id/
router.delete('/teachers/:id/students/:sid',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getId,
  students.isStudentExists,
  students.deleteStudent,
  literacy.deleteLiteracy,
  numeracy.deleteNumeracy,
  social.deleteSocial
);

///teachers/:id/
router.get('/teachers/:id/students',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getStudents,
  literacy.getLiteracy,
  numeracy.getNumeracy,
  social.getSocial,
  students.finalResult,
  students.getResponse
);

//Assessment
///teachers/:id/
router.post('/teachers/:id/students/:sid/literacy',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getId,
  students.isStudentExists,
  teachers.isTeacherAuthorized,
  literacy.findStudent,
  literacy.getAnswers,
  literacy.validateAssessment,
  literacy.assessment,
  numeracy.getStudents,
  social.getStudents,
  students.updateScore,
  literacy.storeIndb
);

router.post('/teachers/:id/students/:sid/numeracy',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getId,
  students.isStudentExists,
  teachers.isTeacherAuthorized,
  numeracy.findStudent,
  numeracy.getAnswers,
  numeracy.validateAssessment,
  numeracy.assessment,
  literacy.getStudents,
  social.getStudents,
  students.updateScore,
  numeracy.storeIndb
);

router.post('/teachers/:id/students/:sid/social',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getId,
  students.isStudentExists,
  teachers.isTeacherAuthorized,
  social.findStudent,
  social.getAnswers,
  social.validateAssessment,
  social.assessment,
  literacy.getStudents,
  numeracy.getStudents,
  students.updateScore,
  social.storeIndb
);

//Reports
router.get('/teachers/:id/reports/class',
  common.isOldApp,
  schools.isValidObjectId,
  teachers.getId,
  teachers.isTeacherExists,
  students.getGreenlights,
  literacy.getResults,
  numeracy.getResults,
  social.getResults,
  classReports.processData
);

//Reports
router.get('/reports/students/:id/teacher',
  common.isOldApp,
  students.getId,
  students.isStudentExists,
  literacy.getLiteracyData,
  numeracy.getNumeracyData,
  social.getScialData,
  teacherReports.processData
);

// Api calls for Admin use

//get schools wrt districts
router.get('/districts/:id/schools',
  schools.getSchoolsFromDistricts,
  schools.getSchoolsFromDistrictsRes
);

router.get('/districts/:id/schools/:sid/teachers',
  schools.isSchoolIsInDistrict,
  teachers.getTeachersFromDist
);

router.post('/counties/:id/districts',
  districts.getDistrictsFromCounty,
  districts.getDistrictsFromCountyRes
);


router.get('/county/:id/districts',
  districts.getDistrictsFromCounty,
  districts.getDistrictsFromCountyRes
);

// Web-Services added by Vivek start

// for getting all the counties
router.get('/getallCounties',
    districts.getallCounties
);


// for getting all the non-admin teacher from county(un-ordered)
router.get('/counties/:id/teachers/:tid/getTeachersFromCountyId',
    districts.getTeachersFromCountyId
);

// for getting all the associated non-admin teacher from county(ordered)
router.get('/teachers/:id/school/:sid/getTeachersFromCountyIdsorted',
    districts.getTeachersFromCountyIdsorted
);

// for saving multiple non-admin teacher's under admin teacher by id
router.post('/saveallTeachersbyId',
    teachers.saveallTeachersbyId
);

// for getting all the non admin teachers list from a particular county
router.get('/teachers/:id/school/:sid/get_county',
    districts.GetcountybyTeachersId

);

// for deleting of any teacher from the system
router.get('/teachers/:id/deleteTeacher',
    teachers.removeTeacher
);

// for removing any associated non-admin teachers from the admin teachers
router.get('/teachers/:id/removingTeacherid/:tid',
    teachers.removeAssociatedTeacher
);

// for export teachers report
router.post('/exportTeachersReport', teachers.teachersReport);

// for get teachers pin
router.get('/teachers/appSettings',teachers.getAppSetting);

// for update teachers pin
router.post('/teachers/pin/update', teachers.updateTeachersPin);

// for update app status
router.post('/teachers/changeAppStatus', teachers.changeAppStatus);

// for update assessment
router.post('/teachers/assessment/update', teachers.updateAssessment);

router.post('/get_districts_by_county_ids', districts.getDistrictsByCountyIds);

router.post('/get_schooles_by_district_ids', districts.getSchoolesByDistrictIds);

router.post('/get_teachers_by_school_ids', teachers.getTeachersBySchoolIds);


router.get('/teachers/appStatus',teachers.checkAppStatus);

router.get('/teachers/checkPin/:pin',teachers.checkPin);

router.post('/county_teacher_report', districts.countyPdfReport);




//Api Error handler
router.use(errorHandler);
module.exports = router;