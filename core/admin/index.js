// @file Administration console features.

function admin() {
  this.tasks = {};

  this.taskDispatcher = function(session, fieldValues) {
    var selection = fieldValues.task;
    var selectedTask = this.tasks[selection];
    selectedTask.callback(session);
    return true;
  }

  var fields = [];
  fields['task'] = {
    name: 'task',
    type: 'select',
    title: '\n%green%Options:%green%\n\n',
    options: {}
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
    cachedPrompt.fields['task'].title = '\n%green%Options:%green%\n\n' + promptOptions;
    Prompt.start('admintasks', session);
  }
};

module.exports = new admin();
