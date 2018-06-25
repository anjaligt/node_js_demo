'use strict';

var express             =   require('express');
var router              =   express.Router();
var login               =   require('../routes/web/login');
var dashboard           =   require('../routes/web/dashboard');
var reports             =   require('../routes/web/reports');
var districts           =   require('../routes/api/districts');
var schools             =   require('../routes/api/schools');
var students            =   require('../routes/api/students');
var teachers            =   require('../routes/api/teachers');
var literacy            =   require('../routes/api/literacy');
var numeracy            =   require('../routes/api/numeracy');
var social              =   require('../routes/api/social');
var billing             =   require('../routes/api/billing');
var apiReports          =   require('../routes/api/reports');
var schoolsWeb          =   require('../routes/web/schools');
var teachersWeb         =   require('../routes/web/teachers');
var managementWeb       =   require('../routes/web/management');
var manage_districtWeb  =   require('../routes/web/manage_district');
var manage_schoolsWeb   =   require('../routes/web/manage_schools');


/* GET home page. */
router.get('/', login.index);
router.post('/', login.login);
router.get('/logout', login.logout);
router.get('/dashboard', dashboard.checkCookie, dashboard.dashboard);
router.get('/reports',
    dashboard.checkCookie,
    districts.getCounties,
    reports.render
);


router.get('/schools',
    dashboard.checkCookie,
    districts.getCounties,
    districts.getDistricts,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    schools.getCompleteSchoolList,
    schoolsWeb.render
);

router.get('/schools/delete/:id',schools.deleteSchool);


router.post('/schools/add', schools.create);

// custom changes in function starts
router.post('/schools/addnew',
    dashboard.checkCookie,
    schools.createnew,
    function(req, res) {
        req.flash('info', 'School added successfully');
        res.redirect('/management');
    }
);
// custom changes in function ends


router.post('/schools/update', schools.update);


router.get('/teachers',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    teachers.getCompleteTeachersList,
    teachers.get_Count_normal_teacher,
    teachers.get_Count_admin_teacher,
    teachersWeb.render
);

router.get('/teachers_activity',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    teachers.getTeachersActivityList,
    teachers.get_Count_normal_teacher,
    teachers.get_Count_admin_teacher
);

router.get('/teachers_activity_list',teachers.getTeachersActivityListData);



//teachers_activityWeb
// router.post('/teachers/delete/:id',
//   dashboard.checkCookie,
//   teachersWeb.extractTeacherId,
//   teachers.isTeacherExists,
//   teachers.deleteTeacher,
//   teachers.updateTeacherCount,
//   function ( req, res ) {
//     //this was for ajax request
//     //res.status(200).send('ok');
//     req.flash('info', 'Teacher deleted successfully');
//     res.redirect('/teachers');
//   }
// );

router.post('/teachers/delete/:id',
    dashboard.checkCookie,
    teachersWeb.extractTeacherId,
    teachers.isTeacherExists,
    teachers.disableTeacher,
    teachers.updateTeacherCount,
    function(req, res) {
        req.flash('info', 'Teacher deleted successfully');
        res.redirect('/teachers');
    }
);

router.post('/teachers/delete_teachers', teachers.deleteTeachers);

router.post('/teachers/resend', teachers.resendPassword);


router.post('/teachers/addByAdmin',
    teachers.extractTeacherParamsForPost,
    teachers.checkTeacherByAdmin,
    teachers.processTeacherSchoolMasterData, //new function
   // teachers.validations,
    teachers.createTeacher,
    //teachers.sendEmail,
    function(req, res) {
        res.json({
            success: true,
            data: [],
            message: 'Teacher successfully save.'
        });
    }
);


router.post('/teachers/edit',
    teachers.extractParamsForEditPost,
    teachers.checkEditTeacher,
    teachers.update,
    function(req, res) {
        res.json({
            success: true,
            data: [],
            message: 'Teacher successfully updated.'
        });
    }
);

router.post('/teachers/email',teachers.sendBulkEmailToUsers);


//get county reports
router.get('/counties/:cid/reports',
    districts.getCounties,
    districts.getDistricts,
    schools.getCompleteSchoolList,
    districts.getDistrictsFromCounty,
    districts.getCountyFromId,
    schools.getSchoolsFromMulitpleDistricts, //get the schools in a particular county (we have all county districts in req.store.get('districts')) here and store it in req.store.set('schools', schools);
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    districts.getSchoolsAndDistricts,
    apiReports.createReport,
    apiReports.download
);


//get districts reports
router.get('/counties/:cid/districts/:id/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createReport,
    apiReports.download
);


router.get('/counties/:cid/districts/:id/schools/:sid/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createReport,
    apiReports.download
);


router.get('/counties/:cid/districts/:id/schools/:sid/teachers/:tid/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    teachers.getTeacherName,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createReport,
    apiReports.download
);


router.get('/districts/all',
    students.getAllStudents,
    apiReports.getDatas,
    districts.getSchoolsAndDistricts,
    apiReports.createReport,
    apiReports.allDownload
);


//get old formatted reports

//get county reports
router.get('/format/counties/:cid/reports',
    districts.getCounties,
    districts.getDistricts,
    schools.getCompleteSchoolList,
    districts.getDistrictsFromCounty,
    districts.getCountyFromId,
    schools.getSchoolsFromMulitpleDistricts, //get the schools in a particular county (we have all county districts in req.store.get('districts')) here and store it in req.store.set('schools', schools);
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    districts.getSchoolsAndDistricts,
    apiReports.createSimpleReport,
    apiReports.download
);

router.get('/format/counties/:cid/districts/:id/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createSimpleReport,
    apiReports.download
);

router.get('/format/counties/:cid/districts/:id/schools/:sid/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createSimpleReport,
    apiReports.download
);

router.get('/format/counties/:cid/districts/:id/schools/:sid/teachers/:tid/reports',
    districts.getCountyFromId,
    districts.getDistrictFromId,
    schools.getSchoolsFromDistricts,
    schools.getSchoolIds,
    teachers.getTeacherName,
    students.getStudentsFromSchools,
    apiReports.getDatas,
    apiReports.createSimpleReport,
    apiReports.download
);

router.get('/format/districts/all',
    students.getAllStudents,
    apiReports.getDatas,
    districts.getSchoolsAndDistricts,
    apiReports.createSimpleReport,
    apiReports.allDownload
);

router.get('/teachers/:id/all_associated',
    teachers.getAssociatedTeachers
);


router.get('/teachers/get_associated/:id',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    teachers.getAssociatedTeachers
);




// County Management Section Start
router.get('/management', districts.counties_count);

router.get('/districts/search_by_name', districts.search_counties);

router.get('/districts/search_by_districtname/:query/:id',
    districts.search_districts
);


router.get('/schools/search_by_schoolname/:query/:id',
    schools.search_school_by_name
);

router.post('/districts/update', districts.update);

router.post('/schools/delete/:id',
    schools.deleteSchool,
    function(req, res) {
        res.json({
            success: true,
            data: [],
            message: 'School successfully deleted.'
        });
    }
);

router.get('/district/delete/:id',
    districts.deleteDistrict,
    function(req, res) {
        res.json({
            success: true,
            data: [],
            message: 'District successfully deleted.'
        });
    }
);

router.get('/county/delete/:id',
    districts.deleteCounty,
    function(req, res) {
        res.json({
            success: true,
            data: [],
            message: 'County successfully deleted.'
        });
    }
);



router.post('/counties/add', districts.create);

router.post('/counties/update', districts.updateCounty);

router.post('/districts/add', districts.createDistricts);

router.get('/management/:query', dashboard.checkCookie, districts.search_counties);

router.get('/manage_district/:id', districts.getDistrictsByCountyId);

router.get('/manage_schools/:id', schools.getSchoolesByDistrictId);

// County Management Section End's


// Billing Module starts
router.get('/billing_old',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    teachers.getCompleteTeachersList,
    billing.extractParams
);

router.post('/billing',billing.getAllBillingCounties);
// Billing module ends


// reports dashboard API starts
router.get('/reportsDashboard',
    districts.total_counties,
    districts.district_count,
    schools.total_schools_count,
    students.total_students_count,
    teachers.total_registered_teacher,
    teachers.total_loggedin_teacher,
    apiReports.extractParams
);

router.get('/reports_teacher_participation',
    teachers.total_registered_teacher,
    teachers.total_loggedin_teacher,
    apiReports.extractTeacherParticipationParams
);

router.get('/reports_global_assesment_completion',
    students.total_students_count,
    literacy.total_litearcy_count,
    apiReports.extractStudentsParams
);

router.post('/teachers_dashboard_charts',teachers.teachersDashboardCharts);

router.post('/counties_districts_schools_count',districts.getCountyDistrictAndSchools);
router.get('/get_teachers',teachers.getTeachers);
   // students.total_students_count,
   // literacy.total_litearcy_count,
   // apiReports.extractStudentsParams
//);

router.post('/change_billing_status',schools.changeBillingStatus);

router.post('/update_county_amount',districts.updateCountyAmount);

router.post('/update_district_amount',districts.updateDistrictAmount);

router.post('/update_school_amount',schools.updateSchoolAmount);

router.post('/update_district_status',districts.updateDistrictStatus);

router.post('/export_to_pdf',teachers.exportPdf);

router.post('/get_school_students_by_percent',students.getSchoolStudentsByPercent);

router.post('/send_students_report_by_email',students.sendStudentsReportByEmail);

router.get('/all_counties', districts.get_all_counties);



// router.get('/dashboard_tools',
//     districts.getCounties,
//     districts.getDistricts,
//     schools.getSchools,
//     schoolsWeb.extractParams,
//     schoolsWeb.extractQuery,
//     students.total_students_count,
//     numeracy.getAllNumeracy,
//     numeracy.getAllNumeracyCount,
//     literacy.getAllLiteracy,
//     literacy.getAllLiteracyCount,
//     social.getAllSocial,
//     social.getAllSocialCount,
//     apiReports.extractParamsForTools
// );

router.post('/get_literacy_numeracy_social',students.getLiteracyNumeracyAndSocial);

router.get('/dashboard_tools',apiReports.getDashboardTotalReport);


// for Removing all the students without teachers starts
router.get('/remove_students_without_teachers',teachers.removeStudentsWithoutTeachers);
// for Removing all the students without teachers ends





router.post('/reports_download',
    teachers.getAllTeachers,
    students.StudentsByMultipleTeachers,
    apiReports.extractParamsForDownloadReport
);

router.post('/detailed_report_one', apiReports.detailedReportOne);

router.post('/detailed_report_two', apiReports.detailedReportTwo);

router.post('/export_green_yello_red_pdf_report', apiReports.exportGreenYelloRedPdfReport);

router.post('/detailed_report_third',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    districts.total_counties,
    districts.district_count,
    schools.total_schools_count,
    apiReports.extractParamsForDetailedReportThird
);

router.post('/detailed_report_fourth_old',
    districts.getCounties,
    districts.getDistricts,
    schools.getSchools,
    schoolsWeb.extractParams,
    schoolsWeb.extractQuery,
    students.total_students_count,
    numeracy.getAllNumeracy,
    numeracy.getAllNumeracyCount,
    literacy.getAllLiteracy,
    literacy.getAllLiteracyCount,
    social.getAllSocial,
    social.getAllSocialCount,
    apiReports.extractParamsForDetailedReportFourth
);
router.post('/detailed_report_fourth',apiReports.extportDetailReportFourth);


// reports dashboard API ends
module.exports = router;
