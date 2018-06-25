'use strict';

exports.doAjax = function (url, data, done, fail) {
  $.ajax({
    type: 'GET',
    url: url,
    data: data,
    dataType: 'json'
  })
  .done(function(data, textStatus, jqXHR) {
    parseResponse(jqXHR, function(err, response) {
      if (err) {
        return fail(err);
      }
      done(null, response);
    });
  })
  .fail(function(jqXHR) {
    parseResponse(jqXHR, function(err) {
      fail(err);
    });
  });
};

function parseResponse(jqXHR, done) {
  var response = jqXHR.responseText;
  if (response) {
    try {
      response = JSON.parse(response);
    } catch(e) {
      done(new Error('Failed to parse response'));
    }
    done(null, response);
  }
}