// Generated by CoffeeScript 1.8.0
var Alarm, User, americano, log,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

americano = require('americano-cozy');

log = require('printit')({
  prefix: 'alarm:model'
});

User = require('./user');

module.exports = Alarm = americano.getModel('Alarm', {
  action: {
    type: String,
    "default": 'DISPLAY'
  },
  trigg: {
    type: String
  },
  description: {
    type: String
  },
  timezone: {
    type: String
  },
  rrule: {
    type: String
  },
  tags: {
    type: function(x) {
      return x;
    }
  },
  related: {
    type: String,
    "default": null
  },
  created: {
    type: String
  },
  lastModification: {
    type: String
  }
});

require('cozy-ical').decorateAlarm(Alarm);

Alarm.all = function(params, callback) {
  return Alarm.request("all", params, callback);
};

Alarm.tags = function(callback) {
  return Alarm.rawRequest("tags", {
    group: true
  }, function(err, results) {
    var out, result, tag, type, _i, _len, _ref;
    if (err) {
      return callback(err);
    }
    out = {
      calendar: [],
      tag: []
    };
    for (_i = 0, _len = results.length; _i < _len; _i++) {
      result = results[_i];
      _ref = result.key, type = _ref[0], tag = _ref[1];
      out[type].push(tag);
    }
    return callback(null, out);
  });
};

Alarm.createOrGetIfImport = function(data, callback) {
  if (data["import"]) {
    return Alarm.request('byDate', {
      key: data.trigg
    }, function(err, alarms) {
      if (err) {
        log.error(err);
        return Alarm.create(data, callback);
      } else if (alarms.length === 0) {
        return Alarm.create(data, callback);
      } else if (data.description === alarms[0].description) {
        log.warn('Alarm already exists, it was not created.');
        return callback(null, alarms[0]);
      } else {
        return Alarm.create(data, callback);
      }
    });
  } else {
    return Alarm.create(data, callback);
  }
};

Alarm.prototype.getAttendeesEmail = function() {
  return [User.email];
};

Alarm.prototype.migrateDoctype = function() {
  var d;
  if (!this.trigg) {
    return this;
  }
  if ((this.trigg.charAt(10)) === 'T') {
    return this;
  }
  d = this.trigg;
  if (__indexOf.call(d, "GMT") < 0) {
    d = d + " GMT+0000";
  }
  this.trigg = new Date(d).toISOString();
  this.timezone = void 0;
  this.rrule = void 0;
  return this.save((function(_this) {
    return function(err) {
      if (err) {
        console.log(err);
      }
      return _this;
    };
  })(this));
};

Alarm.migrateAll = function() {
  return Alarm.all({}, function(err, alarms) {
    var alarm, _i, _len, _results;
    if (err) {
      console.log(err);
      return;
    }
    _results = [];
    for (_i = 0, _len = alarms.length; _i < _len; _i++) {
      alarm = alarms[_i];
      _results.push(alarm.migrateDoctype());
    }
    return _results;
  });
};
