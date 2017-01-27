// @file Administration console features.

function admin() {};

// Storage for admin tasks registered by core/modules.
admin.prototype.tasks = {};

/**
 * Primary admin task selection screen.
 *
 * @param session
 *   Character session object.
 *
 */
admin.prototype.listTasks = function(session) {
  var taskKeys = Object.keys(Admin.tasks);
  var taskOptions = {};
  var promptOptions = '';
  for (var i = 0; i < taskKeys.length; ++i) {
    var taskKey = taskKeys[i];
    var task = Admin.tasks[taskKey];
    taskOptions[taskKey] = task.name;
    promptOptions += '%green%[' + taskKey + '] ' + task.name + '%green%\n';
  }

  var taskPrompt = Prompt.new(session, Admin.taskDispatcher);
  var taskSelectField = taskPrompt.newField('select');
  taskSelectField.name = 'task';
  taskSelectField.options = taskOptions;
  taskSelectField.formatPrompt('\n%green%Options:%green%\n\n' + promptOptions, true);
  taskSelectField.cacheInput = function(input) {
    this.value = input;
    return true;
  }
  taskPrompt.addField(taskSelectField);

  taskPrompt.start();
}

/**
 * Prompt completion callback for the admin task selection screen.
 *
 * @param session
 *   Character session object.
 *
 * @param fieldValues
 *   User selection values.
 */
admin.prototype.taskDispatcher = function(session, fieldValues) {
  var selection = fieldValues.task;
  var selectedTask = Admin.tasks[selection];
  console.log(selectedTask);
  selectedTask.callback(session);
  return true;
}

module.exports = new admin();
