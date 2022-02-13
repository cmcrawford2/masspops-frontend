import React, { Component } from 'react'
import './App.css';

class App extends Component {
  // topic, polls and questions are the user's choices.
  // the other arrays are the possibilities, depending on the choices.
  state = {
    topics: [],
    polls: [],
    questions: [],
    allTopicsArr: [],
    allQuestionIds: [],
    allPollsArray: [],
    allQuestions: [],
    allResults: []
  }

  componentDidMount() {
    // Get all the possible topics, the starting point.
    console.log("starting");
    this.getTopics();
    // this.getTestVar();
  }

  getTestVar = async() => {
    await fetch('https://masspops-server.herokuapp.com/v1/home')
      .then(res => res.json().then((data) => {
        console.log(data.message);
      }))
  }
  
  getTopics = async () => {
    let topicsArray = [];
    await fetch('https://masspops-server.herokuapp.com/v1/topics')
      .then(res => res.json().then((data) => {
        topicsArray = data.topics.map(topic => {
          return (
            {
              topicId: topic.topic_id,
              topic: topic.topic,
              checked: 0,
            }
          )}
        )
      })).then(console.log(topicsArray));
    this.setState({allTopicsArr: topicsArray});
  }

  // Topics section

  renderTopicForm = () => {
  // Main: We have all possible topics for the given topic initilized in state.
  // Render each topic as a checkbox input.
  const topicDivs = this.renderTopics();
  return (
    <form onSubmit={ this.selectTopics }>
      <div key='0'>
        <input
          type="checkbox"
          id={"allTopics"}
          name={"all"}
          onChange={e=>this.toggleAllTopics(e)}
        />
        <label htmlFor={"all"}>{"All Topics"}</label>
      </div>
      { topicDivs }
      <input type="submit"/>
    </form>
  )}

  renderTopics = () => {
    const topicDivs = this.state.allTopicsArr.map(topic => {
      const topicId = topic.topicId;
      return(
        <div key={topicId}>
          <input
            type="checkbox"
            id={topicId}
            name={topicId}
            value={topic.topic}
            onChange={e=>this.toggleTopicCheckbox(e, topicId)}
          />
          <label htmlFor={topicId}>{topic.topic}</label>
        </div>
      )}
    )
    return topicDivs;
  }

  toggleAllTopics(e) {
    const allCheckbox = document.getElementById("allTopics");
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = allCheckbox.checked);
    const topics = this.state.allTopicsArr;
    topics.forEach(topic => topic.checked = allCheckbox.checked ? 1 : 0);
    this.setState({allTopicsArr: topics});
  }

  toggleTopicCheckbox = (e, topicId) => {
    // Checkbox callback for each topic
    // Also uncheck "All Topics" if the user selects any single topic.
    const allCheckbox = document.getElementById("allTopics");
    allCheckbox.checked = false;
    const topics = this.state.allTopicsArr;
    const index = topics.findIndex(topic => topic.topicId === topicId);
    topics[index].checked = 1 - topics[index].checked;
    this.setState({allTopicsArr: topics});
  }

  selectTopics = (e) => {
    // Select button callback for poll list
    e.preventDefault();
    const selectedTopics = this.state.allTopicsArr.filter((topic)=>topic.checked===1);
    // Topics have been selected. Initialize all possible topics.
    this.getSelectedPolls(selectedTopics);
  }

  getSelectedPolls = async (selectedTopics) => {
    // We need to get all polls which include the selected Topics.
    // We have to get polls from the questions.
    const topicIds = selectedTopics.map(topic => topic.topicId);
    console.log(topicIds);
    const topicIdString = "(" + topicIds.join() + ")";
    let questionIds = [];
    await fetch(`https://masspops-server.herokuapp.com/v1/topicQuestions/${topicIdString}`)
      .then(res => res.json().then((data) => {
        questionIds = data.questionIds.map(questionId => `'${questionId.Question_ID}'`);
      }))

    // Get all of the unique poll ids that contain relevant topics.
    const questionIdString = "(" + questionIds.join() + ")";
    let pollIdArray = [];
    await fetch(`https://masspops-server.herokuapp.com/v1/pollIds/${questionIdString}`)
      .then(res => res.json().then((data) => {
        pollIdArray = data.pollIds.map(pollId => `'${pollId.Poll_ID}'`);
      }))
    const pollIdString = "(" + pollIdArray.join() + ")";
    let pollArray = [];
    await fetch(`https://masspops-server.herokuapp.com/v1/polls/${pollIdString}`)
      .then(res => res.json().then((data) => {
        pollArray = data.polls.map(poll => { return({
          pollId: poll.poll_id,
          pollUrl: poll.url,
          pollster: `${poll.pollster}`,
          checked: 0
        })})
      }))
  
    this.setState({ topics: selectedTopics, allQuestionIds: questionIds, allPollsArray: pollArray });
  }

  // Polls section

  renderPollForm = () => {
    // Main: We have all possible polls for the given topic initilized in state.
    // Render each poll as a checkbox input.
    const pollDivs = this.renderPolls();
    return (
      <form onSubmit={ this.selectPolls }>
        <div key='0'>
          <input
            type="checkbox"
            id={"allPolls"}
            name={"all"}
            onChange={e=>this.toggleAllPolls(e)}
          />
          <label htmlFor={"all"}>{"All Polls"}</label>
        </div>
        { pollDivs }
        <input type="submit"/>
      </form>
    )
  }

  renderPolls = () => {
    const pollDivs = this.state.allPollsArray.map(poll => {
      const pollId = poll.pollId;
      return(
        <div key={pollId}>
          <input
            type="checkbox"
            id={pollId}
            name={pollId}
            value={poll.pollster}
            onChange={e=>this.togglePollCheckbox(e, pollId)}
          />
          <label htmlFor={pollId}>{poll.pollster}</label>
        </div>
      )}
    )
    return pollDivs;
  }

  toggleAllPolls(e) {
    const allCheckbox = document.getElementById("allPolls");
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = allCheckbox.checked);
    const polls = this.state.allPollsArray;
    polls.forEach(poll => poll.checked = allCheckbox.checked ? 1 : 0);
    this.setState({allPollsArray: polls});
  }

  togglePollCheckbox = (e, pollId) => {
    // Checkbox callback for each poll
    // Also uncheck "All Polls" if the user selects any single poll.
    const allCheckbox = document.getElementById("allPolls");
    allCheckbox.checked = false;
    const polls = this.state.allPollsArray;
    const index = polls.findIndex(poll => poll.pollId === pollId);
    polls[index].checked = 1 - polls[index].checked;
    this.setState({allPollsArray: polls});
  }

  selectPolls = (e) => {
    // Select button callback for poll list
    e.preventDefault();
    const selectedPolls = this.state.allPollsArray.filter((poll)=>poll.checked===1);
    // Polls have been selected. Initialize all possible questions.
    this.getSelectedQuestions(selectedPolls);
  }

  getSelectedQuestions = async (selectedPolls) => {
    const pollIds = selectedPolls.map((poll) => `'${poll.pollId}'`);
    // Set up parameters for the query
    const pollIdString = "(" + pollIds.join() + ")";
    const questionIdString = "(" + this.state.allQuestionIds.join() + ")";
    // Fetch the subset of questions that belong to the selected polls.
    const url = 'https://masspops-server.herokuapp.com/v1/questionIds/' + pollIdString + '/' + questionIdString;
    let questionIdArray = [];
    await fetch(url)
      .then(res => res.json().then((data) => {
        questionIdArray = data.questionIds.map(questionId => questionId.Question_ID);
      }))
    const questionIds = "(" + questionIdArray.join() + ")";

    // Get all possible questions for this topic and selected polls.
    let questionArray = [];
    await fetch(`https://masspops-server.herokuapp.com/v1/questions/${questionIds}`)
      .then(res => res.json().then((data) => {
        questionArray = data.questions.map(question => {return({
          questionId: question.Question_ID,
          question: question.Question,
          checked: 0
      })})
    }))
    this.setState({polls: selectedPolls, allQuestions: questionArray})
  }

  // Question section

  renderQuestionForm = () => {
    // Main: we have all possible questions. Put up a form to select them.
    const questionDivs = this.renderQuestions();
    return (
      <form onSubmit={ this.selectQuestions }>
        <div key='0'>
          <input
            type="checkbox"
            id={"allQuestions"}
            name={"all"}
            onChange={e=>this.toggleAllQuestions(e)}
          />
          <label htmlFor={"all"}>{"All Questions"}</label>
        </div>
        { questionDivs }
        <input type="submit"/>
      </form>
    )
  }

  renderQuestions = () => {
    // We have a topic and selected polls and all the question ids that belong to them.
    // Now we need to ask the user to choose the questions.
    const questionDivs = this.state.allQuestions.map(question => {
      const questionId = question.questionId;
      return(
        <div key={questionId}>
          <input
            type="checkbox"
            id={questionId}
            name={questionId}
            value={question.question}
            onChange={e=>this.toggleQuestionCheckbox(e, questionId)}
          />
          <label htmlFor={questionId}>{question.question}</label>
        </div>
      )}
    )
    return questionDivs;
  }

  toggleAllQuestions(e) {
    const allCheckbox = document.getElementById("allQuestions");
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = allCheckbox.checked);
    const questions = this.state.allQuestions;
    questions.forEach(question => question.checked = allCheckbox.checked ? 1 : 0);
    this.setState({allQuestions: questions});
  }

  toggleQuestionCheckbox = (e, questionId) => {
    // Also uncheck "All Questions" if the user selects any single question.
    const allCheckbox = document.getElementById("allQuestions");
    allCheckbox.checked = false;
    const questions = this.state.allQuestions;
    const index = questions.findIndex(question => question.questionId === questionId);
    questions[index].checked = 1 - questions[index].checked;
    this.setState({allQuestions: questions});
  }

  selectQuestions = (e) => {
    // Select button callback for poll list.
    e.preventDefault();
    const selectedQuestions = this.state.allQuestions.filter((question)=>question.checked===1);
    // Once we have selected questions, initialize the results.
    this.getResults(selectedQuestions);
  }

  getResults = async (selectedQuestions) => {
    const questionIds = selectedQuestions.map((question) => question.questionId);
    const questionIdString = "(" + questionIds.join() + ")";
    let allResults = [];
    await fetch(`https://masspops-server.herokuapp.com/v1/results/${questionIdString}`)
      .then(res => res.json().then((data) => {
        allResults = data.results.map(result => {return({
          pollId: result.Poll_ID,
          questionId: result.Question_ID,
          options: result.Options,
          results: result.Results
        })})
      }))
    this.setState({questions: selectedQuestions, allResults: allResults})
  }

  // Results section

  renderResults = () => {
    // For each poll, render the questions and their results.
    const pollResults = this.state.polls.map(poll => this.renderPollResults(poll));
    return (
      <div>
        <h2>Results for selected topics</h2>
        {pollResults}
      </div>
    )
  }

  renderPollResults = (poll) => {
    const pollResults = this.state.questions
      .map(question => this.renderQuestion(poll.pollId, question))
      .filter(result => result !== undefined)
    if (pollResults.length === 0) return;
    console.log(poll.url);
    return (
      <div key={poll.pollId}>
        <h3>Poll: <a href={poll.pollUrl}>{poll.pollster}</a></h3>
        { pollResults }
      </div>
    )
  }
  
  renderQuestion = (pollId, question) => {
    const resultArray = this.state.allResults
      .filter(result => result.pollId === pollId && result.questionId === question.questionId);
    if (resultArray.length === 0) return;
    const resultTable = this.renderResultTable(resultArray);
    const key = `${pollId}.${question.questionId}`
    return (
      <div key={key}>
        <p>{question.question}</p>
        {resultTable}
      </div>
    )
  }

  renderResultTable(results) {
    // TODO: See if I really need return here.
    const tableRows = results.map((result, index) => {return(
      <tr key={index}>
      <td>{result.options}</td>
      <td>{`${Math.round(result.results*100)}%`}</td>
      </tr>)
    });
    return (
      <div>
      <table>
        <tbody>
        {tableRows}
        </tbody>
      </table>
      </div>
    )
  }

  render () {
    return (
      <div>
      { this.state.topics.length === 0 &&
        <div id="topics_page">
          <h1>Choose one or more topics</h1>
          { this.renderTopicForm() }
        </div>
      }
      { this.state.topics.length !== 0 &&
        this.state.polls.length === 0 &&
        <div id="polls_page">
          <h1>Choose one or more polls for this topic</h1>
          { this.renderPollForm() }
        </div>
      }
      { this.state.topics.length !== 0 &&
        this.state.polls.length !== 0 &&
        this.state.questions.length === 0 &&
        <div id="questions_page">
          <h1>Choose one or more questions on this topic</h1>
          { this.renderQuestionForm() }
        </div>
      }
      { this.state.topics.length !== 0 &&
        this.state.polls.length !== 0 &&
        this.state.questions.length !== 0 &&
        <div id="results_page">
          { this.renderResults() }
        </div>
      }
      </div>
    )
  }
}

export default App;
