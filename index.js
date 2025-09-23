const inquirer = require('inquirer').createPromptModule();

async function askQuestions() {
  console.log('Welcome! Let me ask you some basic questions.\n');

  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'What is your name?',
      validate: function(input) {
        if (input.length < 2) {
          return 'Please enter a name with at least 2 characters.';
        }
        return true;
      }
    },
    {
      type: 'input',
      name: 'email',
      message: 'What is your email address?',
      validate: function(input) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(input)) {
          return 'Please enter a valid email address.';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'favoriteColor',
      message: 'What is your favorite color?',
      choices: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Other'],
      default: 'Blue'
    },
    {
      type: 'confirm',
      name: 'likesProgramming',
      message: 'Do you like programming?',
      default: true
    },
    {
      type: 'number',
      name: 'age',
      message: 'What is your age?',
      validate: function(input) {
        if (isNaN(input) || input < 1 || input > 120) {
          return 'Please enter a valid age between 1 and 120.';
        }
        return true;
      }
    },
    {
      type: 'checkbox',
      name: 'hobbies',
      message: 'What are your hobbies? (Select all that apply)',
      choices: [
        'Reading',
        'Sports',
        'Music',
        'Gaming',
        'Cooking',
        'Traveling',
        'Photography',
        'Art'
      ]
    }
  ];

  try {
    const answers = await inquirer(questions);
    
    console.log('\n--- Your Answers ---');
    console.log(`Name: ${answers.name}`);
    console.log(`Email: ${answers.email}`);
    console.log(`Favorite Color: ${answers.favoriteColor}`);
    console.log(`Likes Programming: ${answers.likesProgramming ? 'Yes' : 'No'}`);
    console.log(`Age: ${answers.age}`);
    console.log(`Hobbies: ${answers.hobbies.join(', ')}`);
    
    console.log('\nThank you for answering the questions!');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Run the questions
askQuestions();