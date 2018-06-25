'use strict';
// Write client side JavaScript here
global.jQuery = global.$ = require('jquery');

//Teacher related functions
var teacherId;
function getTeacherId() {
  return teacherId;
}

function setTeacherId(id) {
  teacherId = id;
}

/**
 * Set the teacher id value in the global variable when popover is clicked
 */

$('.teachers-popover-delete').on('click', function() {
  $('.popover').each(function() {
    if($(this).hasClass('in')) {
      $(this).hide();
    }
  });
  var id = $(this).data('id');
  setTeacherId(id);
});

/**
 * Initialize the teacher delete popover
 */
$('.teachers-popover-delete').popover({
  html: true,
  title: function () {
    return '<b>Delete</b>';
  },
  content: function () {
    return $('.teachers-popover-delete-content').html();
  }
});

/**
 * Set the teacher id value in the global variable when popover is clicked
 */

$('.teachers-popover-resend').on('click', function() {
  $('.popover').each(function() {
    if($(this).hasClass('in')) {
      $(this).hide();
    }
  });
  var id = $(this).data('id');
  setTeacherId(id);
});

/**
 * Initialize the teacher delete popover
 */
$('.teachers-popover-resend').popover({
  html: true,
  title: function () {
    return '<b>Are you sure?</b>';
  },
  content: function () {
    return $('.teachers-popover-resend-content').html();
  }
});

/**
 * Modify the cancel event
 */

$('body').on('click', '.teachers-cancel', function (e) {
  e.preventDefault();

  $('.popover').each(function() {
    if($(this).hasClass('in')) {
      $(this).hide();
    }
  });

});

$('body').on('click', '.teachers-deleteLink', function(e) {
  e.preventDefault();
  $(this).parent().attr('action', '/teachers/delete/' + getTeacherId() + '');
  $(this).parent().submit();
});


$('body').on('click', '.teachers-resendLink', function(e) {
  e.preventDefault();
  $(this).parent().attr('action', '/teachers/resend/' + getTeacherId() + '');
  $(this).parent().submit();
});


//School related functions
var schoolId;
function getSchoolId() {
  return schoolId;
}

function setSchoolId(id) {
  schoolId = id;
}

/**
 * Set the school id value in the global variable when popover is clicked
 */

$('.school-popover-delete').on('click', function() {
  $('.popover').each(function() {
    if($(this).hasClass('in')) {
      $(this).hide();
    }
  });
  var id = $(this).data('id');
  setSchoolId(id);
});

/**
 * Initialize the school delete popover
 */
$('.school-popover-delete').popover({
  html: true,
  title: function () {
    return '<b>Delete</b>';
  },
  content: function () {
    return $('.school-popover-delete-content').html();
  }
});

/**
 * Modify the cancel event
 */

$('body').on('click', '.school-cancel', function (e) {
  e.preventDefault();

  $('.popover').each(function() {
    if($(this).hasClass('in')) {
      $(this).hide();
    }
  });

});

$('body').on('click', '.school-deleteLink', function(e) {
  e.preventDefault();
  $(this).parent().attr('action', '/schools/delete/' + getSchoolId() + '');
  $(this).parent().submit();
});

$('body').on('click', '#add_school_btn', function() {
  removeErrorMesage($('.school-alert'));
});

$('body').on('click', '#add_teacher_btn', function() {
  removeErrorMesage($('.teacher-alert'));
});



/*function editSchoolPopup(school) {
    console.log(school);
    $('#add_school_btn').show();

}*/

/**
 * Recipe validation
 */

function setErrorMessage ( $errorDiv ) {
  $errorDiv.removeClass('hide');
}

function removeErrorMesage ( $errorDiv ) {
  $errorDiv.addClass('hide');
}

function submitForm ( $form ) {
  $form.submit();
}

$('body').on('click', '.addSchoolFormBtn', function (e) {
  e.preventDefault();

  if (!validateSchoolForm()) {

    setErrorMessage( $('.school-alert') );

  } else {

    removeErrorMesage( $('.school-alert') );
    //console.log('remove message');
    submitForm($('#addSchoolForm'));

  }

});

function validateSchoolForm () {
  if ($('select[id=e1]').val() <= 0) {
    //console.log('name is missing');
    return false;
  } else if ($('select[id=e2]').val() <= 0) {
    //console.log('prep time is missing');
    return false;
  } else if ($('input[name=schoolName]').val().length <= 0) {
    //console.log('description is missing');
    return false;
  }

  return true;
}

$('body').on('click', '.editSchoolFormBtn', function (e) {
  e.preventDefault();

  if (!validateEditSchoolForm()) {

    setErrorMessage( $('.school-alert-edit') );

  } else {

    removeErrorMesage( $('.school-alert-edit') );
    //console.log('remove message');
    submitForm($('#editSchoolForm'));

  }

});

function validateEditSchoolForm () {
  if ($('input[name=editSchoolName]').val().length <= 0) {
    //console.log('description is missing');
    return false;
  }

  return true;
}

$('body').on('click', '.addTeacherFormBtn', function (e) {
  e.preventDefault();

  if (!validateTeacherForm()) {

    setErrorMessage( $('.teacher-alert') );

  } else {

    removeErrorMesage( $('.teacher-alert') );
    submitForm($('#addTeacherForm'));

  }

});

function validateTeacherForm () {
  var emailReg = /\S+@\S+\.\S+/i;
  if($('input[name=firstName]').val().length <= 0) {
    return false;
  } else if($('input[name=lastName]').val().length <= 0) {
    return false;
  } else if($('input[name=email]').val().length <= 0) {
    return false;
  } else if(!emailReg.test($('input[name=email]').val())) {
    return false;
  } else if ($('select[id=e1]').val() <= 0) {
    //console.log('name is missing');
    return false;
  } else if ($('select[id=e2]').val() <= 0) {
    //console.log('prep time is missing');
    return false;
  } else if ($('select[id=e3]').val() <= 0) {
    //console.log('prep time is missing');
    return false;
  }

  return true;
}



$('body').on('click', '.editTeacherFormBtn', function (e) {
  e.preventDefault();

  if (!validateEditTeacherForm()) {

    setErrorMessage( $('.teacher-alert-edit') );

  } else {

    removeErrorMesage( $('.teacher-alert-edit') );
    submitForm($('#editTeacherForm'));

  }

});

function validateEditTeacherForm () {
  var emailReg = /\S+@\S+\.\S+/i;
  if($('input[name=editFirstName]').val().length <= 0) {
    return false;
  } else if($('input[name=editLastName]').val().length <= 0) {
    return false;
  } else if($('input[name=editEmail]').val().length <= 0) {
    return false;
  } else if(!emailReg.test($('input[name=editEmail]').val())) {
    return false;
  }

  return true;
}

$('body').on('click', '.school-popover-edit', function() {
  var id = $(this).data('id');
  //counties.clear();
  //counties = new Counties('#e1', {placeholder: 'Select County'});
  //counties.change(districts,$(this).data('districtid'));
  //counties.setValue($(this).data('countyid'));
  $('#editSchoolName').val($(this).data('name'));
  $('#editSchoolId').val(id);

  $('#edit_school_btn').trigger('click');
});

$('body').on('click', '.teachers-popover-edit', function() {
  var id = $(this).data('id');
  //counties.clear();
  //counties = new Counties('#e1', {placeholder: 'Select County'});
  //counties.change(districts,$(this).data('districtid'));
  //counties.setValue($(this).data('countyid'));
  $('#editFirstName').val($(this).data('firstname'));
  $('#editLastName').val($(this).data('lastname'));
  $('#editEmail').val($(this).data('email'));
  $('#editTeacherId').val(id);

  $('#edit_teacher_btn').trigger('click');
});