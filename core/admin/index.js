// @file Administration console features.

function admin() {
  this.tasks = {
    m: {
      name: 'Manage Modules',
      callback: function(session) {
        session.write('manage modules?');
        session.inputContext = 'command';
      }
    }
  };
};


admin.prototype.inputHandler  = function(session, inputRaw) {
  var input = inputRaw.replace(/(\r\n|\n|\r)/gm,"");

  if (input === '') {
    Admin.listTasks(session);
  }
}

admin.prototype.listTasks = function(session) {
  console.log(Admin.tasks);
  var taskKeys = Object.keys(Admin.tasks);
  var taskOptions = {};
  for (var i = 0; i < taskKeys; ++i) {
    var task = tasks[taskKeys[i]];
    taskOptions[taskKeys[i]] = task.name;
  }

  var taskPrompt = Prompt.new(session, Admin.taskDispatcher);
  var taskSelectField = taskPrompt.newField('select');
  console.log(taskSelectField);
  taskSelectField.name = 'task';
  taskSelectField.options = taskOptions;
  taskSelectField.formatPrompt('Welcome, admin. What would you like to do today?');
  taskPrompt.addField(taskSelectField);

  taskPrompt.start();
}

admin.prototype.taskDispatcher = function(session, fieldValues) {
  var selection = fieldValues.task;

  var selectedTask = Admin.tasks[selection];
  selectedTask.callback(session);
}

module.exports = new admin();
