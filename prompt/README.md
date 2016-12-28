## API for prompting users for input (similar to form submission)


## Usage

  Start by creating a new prompt. Pass in the user's socket object and a function to call when the last field in the prompt has been completed.

    var myPrompt = prompt.new(socket, my.completionCallbackFunction);


  Define one or more fields as needed:

    // create a new text field:
    var myTexField = myPrompt.newField('text');

    // Set field properties
    myTextField.name = 'mytextfield';
    myTextField.formatPrompt('My Text Field:');

    // add field to prompt
    myPrompt.addField(myTextField);

  Lastly, run the prompt .start() method to begin prompting the user for input.

    myprompt.start();


## Field Types

Currently supported:

  - text: plaintext field, only accepts one line of input.
  - select: select field, only accepts input from pre-defined list of options
  - multi-text: multi-line text field. Accepts one or more lines of text. (@@ to end input)
  - multi-select: select field, accepts one or more input options from predefined list
  - value: hidden field designed to pass a set value straight through to fieldValues
  - int: single value numeric field

### Text field
Single line text field

prompt: adds newline to argument passed to .formatPrompt()

custom prompt: N/A

input sanitization: strips newline and line feed characters

validation: none

validation error: none

input caching: saves sanitized input to .value property of this field.

### Select field
Single select field

prompt: displays prefix, then generates list of options based on contents of field .options property

Custom prompt: performs inline replacement on prefix message and displays prefix only if true is passed as the second argument to .formatPrompt()

input santization: strips newline and line feed characters, converts user input to lower case

validation: checks if input exists in .options property.

validation error: Displays "INPUT is not a valid option"

input caching: saves value associated with INPUT key in options array (ex options = {a:'apple', b:'bacon'}; input 'a' saves 'apple')


### Multi-text field
Multi-line text field

prompt: displays prefix plus (@@ to end)

Custom prompt: N/A

input sanitation: none

validation: checks for @@, ends input if found

validation error: none

input caching: concatinates any lines input


### Multi-select field
Multi-value select field

prompt: displays prefix, the generates list of options based on contents of field .options property

custom prompt: performs inline replacement on prefix message and displays prefix only if true is passed as the second argument to .formatPrompt()

input sanitation: strips newline and line feed characters, converts user input to lower case

validation: checks if input exists in .options property

validation error: Displays "INPUT is not a valid option"

input caching: pushes each selected value onto the field .value array.

### Value field
Single value hidden field

prompt: none, does not prompt user for input..

custom prompt: none, does not prompt user for input.

input sanitation: none, does not accept user input.

validation: none.

validation error: none.

input caching: pushes value onto the field .value array.

### Int field
Single value numeric field

Prompt: displays prefix

input sanitation: strips newline and carriage return and converts input to a number

validation: confirms input is numeric

validation error: Displays "INPUT is not a number."

input caching: saves sanitized input to the .value property of this field


## Conditional fields

Fields may be configured to only display if certain conditions are met. Typically this involves checking the value
of another field in the form. For example, if a new item gets the CONTAINER flag then we need to also prompt for the
container size.

### Usage

To make a field conditional simply set the .conditional property to an object with field and value properties:

var testConditionalField = myPrompt.newField('text');
testConditionalField.name = 'test';
testConditionalField.formatPrompt('Enter a value');
testConditionalField.conditional = {
  field: 'someOtherFieldName',
  value: true
}

## Additional field properties

### replaceInPrefix (select types only)



## Overriding field behaviors



