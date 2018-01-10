// @file Administration console features.

function admin() {
  this.tasks = {};

  this.taskDispatcher = function(session, fieldValues) {
    var selection = fieldValues.task;
    console.log('available tasks:');
    console.log(Admin.tasks);
    console.log('selection:' + selection);
    var selectedTask = Admin.tasks[selection];
    selectedTask.callback(session);
    return true;
  }

  var fields = [];
  fields['task'] = {
    name: 'task',
    type: 'select',
    title: '\n%green%Options:%green%\n\n',
    options: {},
    saveRawInput: true
  }
  Prompt.register('admintasks', fields, this.taskDispatcher);

  this.listTasks = function(session) {
    var taskKeys = Object.keys(this.tasks);
    var taskOptions = {};
    var promptOptions = '';
    for (var i = 0; i < taskKeys.length; ++i) {
      var taskKey = taskKeys[i];
      var task = Admin.tasks[taskKey];
      taskOptions[taskKey] = task.name;
      promptOptions += '%green%[' + taskKey + '] ' + task.name + '%green%\n';
    }
    var cachedPrompt = Prompt.getPrompt('admintasks');
    cachedPrompt.fields['task'].options = taskOptions;
    Prompt.start('admintasks', session);
  }
};

module.exports = new admin();
